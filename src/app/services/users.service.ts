import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  updateDoc
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private firestore: Firestore = inject(Firestore);

  constructor() {
  }

  getAllUsers() {
    const dbRef = collection(this.firestore, 'users');
    const que = query(dbRef, orderBy('email', 'asc'));

    return collectionData(que, { idField: 'id' }) as Observable<User[]>;
  }

  deleteUser(id: string | undefined) {
    const dbRef = doc(this.firestore, 'users', `${ id }`);
    return from(deleteDoc(dbRef));
  }

  updateRole(user: User) {
    const dbRef = doc(this.firestore, `users/${ user.uid }`);
    return from(updateDoc(dbRef, { role: 'member' }));
  }

  reRole(user: User) {
    const dbRef = doc(this.firestore, `users/${ user.uid }`);
    return from(updateDoc(dbRef, { role: 'user' }));
  }
}
