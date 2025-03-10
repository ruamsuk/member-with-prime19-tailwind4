import { inject, Injectable, NgZone } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updateProfile,
  user,
  User,
  UserInfo,
  UserCredential,
  IdTokenResult,
} from '@angular/fire/auth';
import { GoogleAuthProvider } from '@firebase/auth';
import { concatMap, from, Observable, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { doc, docData, Firestore, getDoc, setDoc } from '@angular/fire/firestore';

interface UserProfile {
  displayName: string | null;
  email: string | null;
  role: unknown;
  createdAt?: Date; //เพิ่มฟิลด์ createdAt ลงใน interface และการระบุว่า optional
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth: Auth = inject(Auth);
  firestore: Firestore = inject(Firestore);
  router: Router = inject(Router);
  ngZone: NgZone = inject(NgZone);
  currentUser$: Observable<User | null> = authState(this.firebaseAuth);
  currentUser = toSignal<User | null>(this.currentUser$);
  private timeout: any;

  constructor() {
    this.startTimer();
    this.getUserState().subscribe(user => {
      if (user) {
        this.resetTimer();
      }
    });
  }

  get userProfile$(): Observable<User | null> {
    const user = this.firebaseAuth.currentUser;
    const ref = doc(this.firestore, 'users', `${user?.uid}`);
    if (ref) {
      return docData(ref) as Observable<User | null>;
    } else {
      return of(null);
    }
  }

  getUserState(): Observable<any> {
    return user(this.firebaseAuth);
  }

  startTimer() {
    this.timeout = setTimeout(
      () => {
        this.logout().then(() => {
          console.log('logout');
          this.router.navigateByUrl('/auth/login').then();
        });
      },
      30 * 60 * 1000,
    ); // 30 นาที
  }

  resetTimer() {
    clearTimeout(this.timeout);
    this.startTimer();
  }

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.firebaseAuth, email, password));
  }

  // async login(email: string, password: string): Promise<void> {
  //   try {
  //     const userCredential = await this.ngZone.run(() => signInWithEmailAndPassword(this.firebaseAuth, email, password));
  //     const user = userCredential.user;
  //     await this.saveUserToFirestore(user, user.displayName || '');
  //     await this.saveToLocal(user);
  //   } catch (error) {
  //     console.error('Error during login:', error);
  //     throw error;
  //   }
  // }

  async getUserProfile(uid: string) {
    const userDocRef = doc(this.firestore, 'users', uid);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      return userDocSnapshot.data();
    } else {
      return null;
    }
  }

  forgotPassword(email: string) {
    return from(sendPasswordResetEmail(this.firebaseAuth, email));
  }

  async googleSignIn(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const {user} = await this.ngZone.run(() => signInWithPopup(this.firebaseAuth, provider));
    await this.saveUserToFirestore(user, '');
    await this.saveToLocal(user);
  }

  // async facebookSignIn(): Promise<void> {
  //   const provider = new FacebookAuthProvider();
  //   const { user } = await this.ngZone.run(() => signInWithPopup(this.firebaseAuth, provider));
  //   await this.saveUserToFirestore(user, '');
  //   await this.saveToLocal(user);
  // }

  async signupWithDisplayName(email: string, password: string, displayName: string): Promise<void> {
    const userCredential = await this.ngZone.run(() => createUserWithEmailAndPassword(this.firebaseAuth, email, password));
    await updateProfile(userCredential.user, {displayName});
    await this.saveUserToFirestore(userCredential.user, displayName);
    await this.sendEmailVerification();
    await this.logout();
  }

  async saveUserToFirestore(user: User, displayName: string): Promise<void> {
    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnapShot = await getDoc(userRef);

    if (!userSnapShot.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || displayName,
        role: 'user',
        createdAt: new Date(),
      };
      await setDoc(userRef, userData);
    }
  }

  async saveToLocal(user: User) {
    const userProfile = await this.getUserProfile(user.uid) as UserProfile;

    if (userProfile) {
      const userData = {
        ...userProfile,
      };
      delete userData.createdAt;
      localStorage.setItem('user', JSON.stringify(userData));
    }
  }

  async logout(): Promise<void> {
    return await this.ngZone.run(() => signOut(this.firebaseAuth)).then(
      () => {
        localStorage.clear();
        this.router.navigateByUrl('/auth/login');
      }
    );
  }

  async sendEmailVerification(): Promise<void | undefined> {
    if (this.firebaseAuth.currentUser) {
      return await this.ngZone.run(() => sendEmailVerification(<User>this.firebaseAuth.currentUser));
    }
  }

  // async updateUserProfile(user: UserInfo): Promise<void> {
  //   const currentUser = this.firebaseAuth.currentUser;
  //
  //   if (currentUser) {
  //     if (typeof user.email === 'string') {
  //       await this.ngZone.run(() => updateEmail(currentUser, <string>user.email));
  //     }
  //     await this.ngZone.run(() => updateProfile(currentUser, {
  //       displayName: user.displayName,
  //       photoURL: user.photoURL,
  //     }));
  //   }
  // }

  /** Get From Firestore */
  async getUserRole(uid: string): Promise<string | null> {
    const userProfile = await this.getUserProfile(uid);
    return userProfile ? userProfile['role'] : null;
  }

  /** Get From Firestore */
  async isAuth(): Promise<boolean> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const role = await this.getUserRole(user.uid);
      return role === 'admin' || role === 'manager';
    } else {
      return false;
    }
  }

  /** Get From Firebase Auth. */
  async isAdmin(): Promise<boolean> {
    let idTokenResult = await this.getIdTokenResult();
    if (idTokenResult) {
      return (
        idTokenResult.claims['role'] === 'admin' ||
        idTokenResult.claims['role'] === 'manager'
      );
    } else {
      return false;
    }
  }

  /** Get From Firebase Auth */
  async getRoles() {
    const idTokenResult = await this.firebaseAuth.currentUser?.getIdTokenResult();
    return idTokenResult?.claims['role'];
  }

  getIdTokenResult(): Promise<IdTokenResult> | any {
    return this.firebaseAuth.currentUser?.getIdTokenResult();
  }

  updateProfile(profileData: Partial<UserInfo>): Observable<any> {
    const user = this.firebaseAuth.currentUser;

    return of(user).pipe(
      concatMap((user) => {
        if (!user) throw new Error('Not Authenticated');
        return updateProfile(user, profileData);
      }),
    );
  }

  async newUser(user: any) {
    const currentUser = this.firebaseAuth.currentUser;

    if (currentUser) {
      const updateProfilePromise = this.ngZone.run(() => updateProfile(currentUser, {
        displayName: user.displayName,
        photoURL: user.photoURL,
      }));

      const updateEmailPromise = user.email ? await this.ngZone.run(() => updateEmail(currentUser, user.email)) : await Promise.resolve();

      return await Promise.all([updateProfilePromise, updateEmailPromise])
        .then(() => {
          const userRole = typeof user.role === 'object' && user.role !== null
            ? (user.role as { name: string; }).name
            : user.role;

          const fakeData = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email || currentUser.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            role: userRole,
          };

          const ref = doc(this.firestore, 'users', `${user.uid}`);
          return setDoc(ref, fakeData);
        })
        .catch(error => {
          if (error instanceof Error) {
            console.error('Error updating user profile:', error.message);
          }
          throw error;
        });
    } else {
      return Promise.reject(new Error('No authenticated user found'));
    }
  }
}
