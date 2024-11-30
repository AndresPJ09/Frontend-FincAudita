import { Component, ElementRef, OnInit, ViewChildren, QueryList, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgsComponent } from "../svgs/svgs.component";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../guard/auth.service';
import Swal from 'sweetalert2';
import { NotificationService } from '../notifications/notifications.service'; // Importa el servicio de notificaciones
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { UserService } from '../userprofile/user.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, SvgsComponent, RouterOutlet, RouterLink, RouterLinkActive,FormsModule, HttpClientModule, BsDropdownModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  username: string = '';
  user: any = { id: 0, username: '', password: '',  personId: 0, state: true };
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
  roles: any = [ { id: 0 } ]

  private updatePasswordUrl = 'http://localhost:9191/api/user';

  @ViewChildren('collapse') collapses!: QueryList<ElementRef>;

  menu: any[] = [];
  private activeAccordion: string | undefined;
  profileImageUrl: string | null = null;
  unreadCount = 0;

  authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  

  constructor(private userService: UserService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMenu();
    this.loadUnreadCount();
    this.loadUserData();
    this.userService.profileImageUrl$.subscribe(imageUrl => {
      this.profileImageUrl = imageUrl;
    });
  }
  
  loadProfileImage() {
    this.profileImageUrl = localStorage.getItem('profileImageUrl');
  }

  async loadUserData() {
    await this.loadUser();
    console.log(this.user);
    this.username = this.user.username;
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
          localStorage.setItem('profileImageUrl', this.profileImageUrl as string);

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

  loadMenu() {
    const storedMenu = localStorage.getItem("menu");
    if (storedMenu) {
      const parsedMenu = JSON.parse(storedMenu);
      this.menu = parsedMenu?.menu?.[0]?.listView || [];
    } else {
      this.menu = []; 
    }
  }

  loadUnreadCount() {
    this.notificationService.notifications$.subscribe(notifications => {
      this.unreadCount = notifications.filter(notification => !notification.read).length;
    });
  }

  logout() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Seguro que quieres cerrar sesión!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      
      confirmButtonColor: '#36c236',
      cancelButtonColor: '#ff0000',
    }).then((result) => {
      if (result.isConfirmed) {
        this.showLoadingSpinner();
        
        setTimeout(() => {
          this.authService.logout();
          localStorage.removeItem("menu");
          Swal.close(); // Cierra el popup de carga
          this.router.navigate(['/landing-page']);
  
          Swal.fire({
            title: '¡Cerraste sesión!',
            text: '¡Vuelve pronto!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          
        }, 2000);
      }
    });
  }
  
  showLoadingSpinner() {
    Swal.fire({
      title: 'Cerrando sesión...',
      text: 'Por favor, espera un momento.',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  toggleAccordion(module: string) {
    const collapseElement = this.collapses.find(collapse => collapse.nativeElement.id === module + 'Collapse');
    if (collapseElement) {
      const isCollapsed = collapseElement.nativeElement.classList.contains('show');
      
      if (this.activeAccordion && this.activeAccordion !== module) {
        const previousCollapse = this.collapses.find(collapse => collapse.nativeElement.id === this.activeAccordion + 'Collapse');
        if (previousCollapse) {
          previousCollapse.nativeElement.classList.remove('show');
        }
      }

      if (isCollapsed) {
        collapseElement.nativeElement.classList.remove('show');
        this.activeAccordion = undefined;
      } else {
        collapseElement.nativeElement.classList.add('show');
        this.activeAccordion = module;
      }
    }
  }

  isAccordionOpen(module: string): boolean {
    return this.activeAccordion === module;
  }
}
