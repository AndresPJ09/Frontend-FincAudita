import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-your-password',
  standalone: true,
  imports: [FormsModule, CommonModule, NgbTypeaheadModule, HttpClientModule],
  templateUrl: './forgot-your-password.component.html',
  styleUrl: './forgot-your-password.component.css'
})
export class ForgotYourPasswordComponent {
  currentStep: number = 1;
  email: string = '';
  verificationCode: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordError: string = '';
  timeLeft: number = 30; // Tiempo de espera para reenviar el código
  timer: any;
  showModal: boolean = true;  
  loading: boolean = false; 
  verificationCodeParts: string[] = ["", "", "", ""];
  isCodeComplete: boolean = false;
  user: any = { id: 0, username: '', password: '',  personId: 0, state: true };
  private apiUrl = 'http://localhost:9191/password'; 
  private apiUrlUser = 'http://localhost:9191/api/User';
  constructor(private cdr: ChangeDetectorRef, private router: Router, private http: HttpClient) {}

  isValidPassword(password: string): boolean {
    // Verifica si la contraseña cumple con los requisitos mínimos de longitud
    if (!password || password.length < 8) {
      this.passwordError = 'La contraseña debe tener al menos 8 caracteres.';
      return false;
    }
  
    // Verifica que haya al menos una letra mayúscula
    const hasUpperCase = /[A-Z]/.test(password);
    // Verifica que haya al menos un número
    const hasNumber = /[0-9]/.test(password);
  
    if (!hasUpperCase) {
      this.passwordError = 'La contraseña debe contener al menos una mayúscula.';
      return false;
    }
  
    if (!hasNumber) {
      this.passwordError = 'La contraseña debe contener al menos un número.';
      return false;
    }
  
    // Limpia el mensaje de error si la contraseña es válida
    this.passwordError = '';
    return true;
  }
  
  isPasswordsMatching(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }
  
  togglePasswordVisibility(fieldId: string, iconId: string): void {
    const passwordInput = document.getElementById(fieldId) as HTMLInputElement;
    const icon = document.getElementById(iconId);
  
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon?.classList.remove('fa-eye');
      icon?.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      icon?.classList.remove('fa-eye-slash');
      icon?.classList.add('fa-eye');
    }
  }

  moveToNext(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (/\d/.test(input.value)) {
      this.verificationCodeParts[index] = input.value;
      if (index < 3) {
        const nextInput = document.getElementById(`code-${index + 2}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus(); 
        }
      }
    } else {
      input.value = ""; 
    }
    this.verificationCode = this.verificationCodeParts.join("");
    this.isCodeComplete = this.verificationCodeParts.every((part) => part.length === 1);
  }

  // Método para pasar al siguiente paso
  async nextStep(): Promise<void> {
    if (this.currentStep === 1 && !this.validateEmail()) {
      Swal.fire('Error', 'Por favor, ingrese un correo electrónico válido.', 'error');
      return;
    }

    if (this.currentStep === 1) {
      await this.sendActivationCode();
      return;
    }

    if (this.currentStep === 2 && !this.validateCode()) {
      Swal.fire('Error', 'Por favor, ingrese el código de verificación correctamente.', 'error');
      return;
    }

    if (this.currentStep === 2) {
      if (!this.validateCode()) {
        Swal.fire('Error', 'Por favor, ingrese el código de verificación correctamente.', 'error');
        return;
      }
      
      const storedData = JSON.parse(sessionStorage.getItem('activationData') || '{}');
      if (this.verificationCode === storedData.code) {
        // El código es correcto
        Swal.fire('¡Código Verificado!', 'El código es correcto. Proceda al siguiente paso.', 'success');
        await this.loadUser()
      } else {
        Swal.fire('Error', 'El código de verificación es incorrecto. Por favor, inténtelo de nuevo.', 'error');
      }
      return; 
    }

    if (this.currentStep === 3 && !this.validatePasswords()) {
      Swal.fire('Error', 'Las contraseñas no coinciden o están vacías.', 'error');
      return;
    }

    if (this.currentStep < 3) {
      this.currentStep++;
    } else {
      this.submitPassword();
    }
  }

  // Método para regresar al paso anterior
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Validación del correo electrónico
  validateEmail(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.email);
  }

  // Validación del código de verificación
  validateCode(): boolean {
    return this.verificationCode.length === 4; 
  }

  // Validación de las contraseñas
  validatePasswords(): boolean {
    return !!this.newPassword && !!this.confirmPassword && this.newPassword === this.confirmPassword;
  }
  

  // Confirmar salir y perder datos
  confirmExit(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Si sales, perderás los datos ingresados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#44E32A', 
      cancelButtonColor: '#ff0000',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/login']); // Redirigir al inicio de sesión si se confirma
      }
    });
  }

  // Método para enviar el código de activación
  sendActivationCode(): void {
    if (!this.validateEmail()) {
      Swal.fire('Error', 'Por favor, ingrese un correo electrónico válido.', 'error');
      return; // No continuar si el correo no es válido
    }
  
    // Mostrar alerta con spinner
    Swal.fire({
      title: 'Cargando...',
      text: 'Estamos enviando el código de activación...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); 
      }
    });
  
    const payload = { email: this.email };
    this.http.post(`${this.apiUrl}`, payload).subscribe(
      (response: any) => {
        sessionStorage.setItem('activationData', JSON.stringify(response.data.result));
        Swal.fire('¡Código Enviado!', 'Revisa tu correo para el código de verificación.', 'success');
        this.currentStep = 2;
      },
      (error) => {
        Swal.fire('Error', 'No se pudo enviar el código. Por favor, intenta de nuevo.', 'error');
      }
    );
  }

  // Enviar la nueva contraseña (solo validación por ahora)
  submitPassword(): void {
    if (this.validatePasswords()) {
      this.updatedUser(); 
    } else {
      Swal.fire('Error', 'Las contraseñas no coinciden o están vacías.', 'error');
    }
  }

// Temporizador de 30 segundos
startTimer(): void {
  this.timeLeft = 30;
  this.timer = setInterval(() => {
    this.timeLeft--;
    if (this.timeLeft === 0) {
      clearInterval(this.timer);
    }
  }, 1000);
}


  //metodo para consultar el user
  loadUser(): void {
    const storedData = JSON.parse(sessionStorage.getItem('activationData') || '{}');
    const userId = storedData.id

    if (userId) {
      this.http.get(`${this.apiUrlUser}/${userId}`).subscribe(
        (response: any) => {
          this.user.id = response.id
          this.user.username = response.username
          this.user.personId = response.personId
          this.user.password = response.password
          this.currentStep++;
        },
        (error) => {
          console.error('Error al cargar el usuario:', error);
          Swal.fire('Error', 'No se pudo cargar el usuario. Por favor, intenta de nuevo.', 'error');
        }
      );
    } else {
      Swal.fire('Error', 'No se encontró el ID del usuario en la sesión.', 'error');
    }
  }

  //metodo para actualizar el user
  updatedUser(): void {
    const updatedData = {
      id: this.user.id,
      username: this.user.username,
      password: this.newPassword,
      personId: this.user.personId,
      roles: [{ id: 1 }]
    };
  
    this.http.put(`${this.apiUrlUser}`, updatedData).subscribe(
      (response: any) => {
        Swal.fire('¡Éxito!', 'Contraseña cambiada con éxito.', 'success');
        this.router.navigate(['/login']); 
      },
      (error) => {
        console.error('Error al actualizar el usuario:', error);
        Swal.fire('Error', 'No se pudo actualizar la contraseña. Por favor, intenta de nuevo.', 'error');
      }
    );
  }

  // Confirmar al ir atrás en el segundo paso
  confirmExitToStep1(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Perderás el código ingresado si retrocedes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, regresar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#44E32A', 
      cancelButtonColor: '#ff0000',
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem('activationData'); 
        this.currentStep = 1; 
      }
    });
  }

  // Confirmar al ir atrás en el tercer paso
  confirmExitToStep2(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Perderás las contraseñas ingresadas si retrocedes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, regresar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#44E32A', 
      cancelButtonColor: '#ff0000',
    }).then((result) => {
      if (result.isConfirmed) {
        this.currentStep = 2;
      }
    });
  }

}