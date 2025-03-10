import { Injectable } from '@angular/core';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  constructor(private storage: Storage) {}

  getDownloadURL(path: string): Observable<string> {
    const storageRef = ref(this.storage, path);
    return from(getDownloadURL(storageRef));
  }

  uploadImage(image: File, path: string): Observable<number> {
    const storageRef = ref(this.storage, path);
    const uploadTask = uploadBytesResumable(storageRef, image);

    return new Observable((observer) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          observer.next(progress);
        },
        (error) => observer.error(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            observer.complete();
          });
        },
      );
    });
  }
}
