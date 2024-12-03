import { Injectable } from '@angular/core';
import { User, Auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userObj: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null); 
  userActual$ = this.userObj.asObservable();

  constructor(private auth: Auth, private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
      this.userObj.next(user);
    });
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      if(userCredential) {
        if (userCredential.user?.emailVerified) {
          this.userObj.next(userCredential.user);
  
          return userCredential;
        } else {
          await this.logout();
          Swal.fire({
            title: 'Error de verificación',
            text: "Debes verificar tu email antes de poder ingresar a tu cuenta.",
            icon: 'error',
            heightAuto: false,
          });
          return "noVerificado";
        }
      }
      return null;
    } catch (e) {
      console.error('Error during login:', e);
      return null;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.userObj.next(null);
    } catch (e) {
      console.error('Error during logout:', e);
    }
  }

  async register(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await sendEmailVerification(userCredential.user);
      await this.logout(); 
      Swal.fire({
        title: 'Registro exitoso',
        text: "Por favor, verifica tu correo electrónico antes de iniciar sesión.",
        icon: 'success',
        confirmButtonColor: '#294380',
        confirmButtonText: 'Ir a Login',
        heightAuto: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigateByUrl('login');
        }
      });
      return userCredential;
    } catch (e) {
      console.error('Error during registration:', e);
      return null;
    }
  }

  getUser() {
    return this.userObj.value;
  }

  async isVerified() {
    const user = await this.auth.currentUser;
    return user?.emailVerified || false;
  }

  isAuthenticated(): boolean {
    return this.getUser() !== null;
  }
}
