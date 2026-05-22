import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../../../../service/users.service';
import { HotelsService } from '../../../../../service/hotels.service';
import { HotelStateService } from '../../../../../service/hotel-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  admin: number = Number(localStorage.getItem('token'));
  adminInfo: { name: string; last_name: string; email: string } | null = null;
  hotelName: string = '';
  hotelId: number | null = null;

  ngOnInit(): void {
      this.adminData();
      this.loadInitialHotel();
      this.subscribeToHotelChanges();
    }

    constructor(
      private adminS: UsersService,
      private hotelsService: HotelsService,
      private hotelState: HotelStateService
    ) {}

    private loadInitialHotel(): void {
      const initialHotel = this.hotelState.getSelectedHotel();
      if (initialHotel) {
        this.hotelName = initialHotel.name || '';
        this.hotelId = initialHotel.id;
      } else {
        const hotelIdFromStorage = localStorage.getItem('hotel');
        if (hotelIdFromStorage) {
          this.hotelId = Number(hotelIdFromStorage);
          this.loadHotelById(this.hotelId);
        }
      }
    }

    private subscribeToHotelChanges(): void {
      this.hotelState.hotelName$.subscribe(name => {
        if (name) {
          this.hotelName = name;
        }
      });
    }

    private loadHotelById(hotelId: number): void {
      this.hotelsService.getHotelById(hotelId).subscribe({
        next: (hotel) => {
          this.hotelName = hotel.name || '';
        },
        error: () => {
          this.hotelName = 'Sin hotel';
        }
      });
    }
  
    adminData():void {
      this.adminS.getUser(this.admin).subscribe({
        next: res => {
          this.adminInfo = {
            name: res.name,
            last_name: res.last_name,
            email: res.email
            
          };
          console.log(this.adminInfo)
        }
      });
    }
  
    getAdminInitials(): string {
      if (this.adminInfo) {
        const nameParts = this.adminInfo.name.split(' ');
        const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
        return initials;
      }
      return '';
    }

    getStatus(key: string): string {
      const value = localStorage.getItem(key);
      return value === 'true' ? 'Activo' : 'Inactivo';
    }
  }
