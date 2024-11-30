import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-user-data',
  standalone: true,
  imports: [MatAutocompleteModule, MatInputModule, HttpClientModule, CommonModule, FormsModule, MatExpansionModule],
  templateUrl: './user-data.component.html',
  styleUrl: './user-data.component.css'
})
export class UserDataComponent {

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
  private citysUrl = 'http://localhost:9191/api/City';

  profileImageUrl: string | ArrayBuffer | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.profileImageUrl = localStorage.getItem('profileImageUrl') || '../../assets/Avatar.png';
    this.getCitys();
    this.getPersons();
    
  }

  onInputChange(field: any) {
    field.control.updateValueAndValidity();
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
        console.log("city", this.citys)
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
        console.log(this.person)
        this.filteredCitys = [];
        
    }
}

getCityName(cityId: number): string {
  const city = this.citys.find(city => city.id === cityId);
  return city ? city.name : '';
}

saveChanges() {
    this.updatePerson();
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

}
