import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import Swal from 'sweetalert2';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../userprofile/user.service';
@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CommonModule, HttpClientModule,MatExpansionModule, MatInputModule,
    MatAutocompleteModule],
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.css']
})
export class UserprofileComponent implements OnInit {
  username: string = '';
  password: string = '';
  user: any = { id: 0, username: '', password: '',  personId: 0, state: true };
  filteredCitys: any[] = [];
  persons: any[] = [];
  person: any = {
    id: 0,
    first_name: '',
    last_name: '',
    email: '',
    type_document: '',
    document: '',
    addres: '',
    phone: '',
    birth_of_date: new Date().toISOString().slice(0, 10),
    cityId: 0,
  };
  citys: any[] = [];
  roles: any = [ { id: 0 } ]

  private apiUrl = 'http://localhost:9191/api/Person';
  private updatePasswordUrl = 'http://localhost:9191/api/user';
  private citysUrl = 'http://localhost:9191/api/City';

  profileImageUrl: string | ArrayBuffer | null = null;

  constructor(private http: HttpClient, private changeDetectorRef: ChangeDetectorRef, private userService: UserService) {}

  ngOnInit() {
    this.subscribeToProfileImage();
    this.getCitys();
    this.loadUserData(); 
    this.getPersons();
  }

  subscribeToProfileImage() {
    this.userService.profileImageUrl$.subscribe(imageUrl => {
      this.profileImageUrl = imageUrl;
    });
  }

  getPersons(): void {
    const personId = localStorage.getItem('personId');
    if (personId) {
      this.http.get<any>(`${this.apiUrl}/${personId}`).subscribe(
        (person) => { 
          this.person = {
            ...person,
            birth_of_date: new Date(person.birth_of_date).toISOString().slice(0, 10),
          };
        this.person.cityName = this.getCityName(person.cityId);
        },
        (error) => {
          console.error('Error fetching person:', error);
        }
      );
    } else {
      console.error('No personId found in localStorage.');
    }
  }
  
  getCitys(): void {
    this.http.get<any[]>(this.citysUrl).subscribe(
      (citys) => {
        this.citys = citys;
        this.filteredCitys;
      },
      (error) => {
        console.error('Error fetching cities:', error);
      }
    );
  }

  searchCitys(event: any): void {
    const term = event.target.value.toLowerCase();
    this.filteredCitys = this.citys.filter(city => 
      city.name.toLowerCase().includes(term)
    );
  }

  onCitySelect(event: any): void {
    const selectedcity = this.citys.find(city => 
      city.name === event.option.value
    );
    if (selectedcity) {
        this.person.cityId = selectedcity.id;
        this.person.cityName = selectedcity.name; 
        this.filteredCitys = [];
        
    }
}

getCityName(cityId: number): string {
  const city = this.citys.find(city => city.id === cityId);
  return city ? city.name : '';
}

  async loadUserData() {
    await this.loadUser();
    this.username = this.user.username; 
    this.password = this.user.password;
  }

  

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.userService.updateProfileImage(result); // Actualiza la imagen de perfil a través del servicio
      };
      reader.readAsDataURL(file);
    }
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const icon = document.getElementById('togglePassword');
    
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

  saveChanges() {
    this.updateUser(); 
    this.updatePerson();
  }

  updateUser() {
    const userData = JSON.parse(localStorage.getItem('menu') || '');
    const updatedData = {
      id: userData.menu[0].userID,
      username: this.username, 
      password: this.password,
      personId: this.user.personId,
      roles: this.roles
    };

    const apiUrl = `${this.updatePasswordUrl}/`;
    this.http.put(apiUrl, updatedData).subscribe(
      (response: any) => {
        Swal.fire({
          title: 'Éxito',
          text: 'Usuario actualizado correctamente.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      },
      (error: any) => {
        Swal.fire({
          title: 'Error',
          text: 'Error al actualizar el usuario: ' + error.message,
          icon: 'error',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    );
  }

  updatePerson() {
    const apiUrl = `${this.apiUrl}/`;
    this.http.put(apiUrl, this.person).subscribe(
      (response: any) => {
        Swal.fire({
          title: 'Éxito',
          text: 'Datos de la persona actualizados correctamente.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      },
      (error: any) => {
        Swal.fire({
          title: 'Error',
          text: 'Error al actualizar los datos de la persona: ' + error.message,
          icon: 'error',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    );
  }

  async loadUser(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const storedData = localStorage.getItem('menu');
      const parsedData = storedData ? JSON.parse(storedData) : null;
  
      if (parsedData && parsedData.menu && parsedData.menu[0].userID) {
        const userId = parsedData.menu[0].userID;
  
        this.http.get(`${this.updatePasswordUrl}/${userId}`).subscribe(
          (response: any) => {
            this.user.id = response.id;
            this.user.username = response.username;
            this.user.personId = response.personId;
            this.user.password = response.password;
            this.roles = response.roles;
  
            localStorage.setItem('personId', response.personId.toString());
            localStorage.setItem('profileImageUrl', this.profileImageUrl as string); // Guardar la nueva imagen de perfil
  
            resolve();
          },
          (error) => {
            console.error('Error al cargar el usuario:', error);
            Swal.fire('Error', 'No se pudo cargar el usuario. Por favor, intenta de nuevo.', 'error');
            reject(error);
          }
        );
      } else {
        Swal.fire('Error', 'No se encontró el ID del usuario en la sesión.', 'error');
        reject('No se encontró el ID del usuario en la sesión.');
      }
    });
  }
  
}
