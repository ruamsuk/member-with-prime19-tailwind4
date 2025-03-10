import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { catchError, from, map, Observable, of } from 'rxjs';
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private firestore: Firestore = inject(Firestore);

  constructor() {
  }

  getAllMember(): Observable<Member[]> {
    const dbInstance = collection(this.firestore, 'members');
    const q = query(dbInstance, orderBy('firstname', 'asc'));

    return collectionData(q, {idField: 'id'}) as Observable<Member[]>;
  }

  deleteMember(id: string | undefined) {
    const docInstance = doc(this.firestore, 'members', `${id}`);
    return from(deleteDoc(docInstance));
  }

  updateMember(member: any): Observable<any> {
    const docInstance = doc(this.firestore, `members/${member.id}`);

    return from(updateDoc(docInstance, {...member, updated: new Date()}));
  }

  checkDuplicate(firstname: string, lastname: string): Observable<boolean> {
    const dbInstance = collection(this.firestore, 'members');
    const q = query(dbInstance, where('firstname', '==', firstname), where('lastname', '==', lastname));
    return collectionData(q).pipe(
      map(members => members.length > 0),
      catchError(() => of(false))
    );
  }

  addMember(member: Member): Observable<any> {
    const docRef = collection(this.firestore, 'members');
    return from(addDoc(docRef, {...member, created: new Date()}));
  }
}
