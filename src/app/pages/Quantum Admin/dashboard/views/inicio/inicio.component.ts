import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HotelAdminService } from '../../../../../service/hotel-admin.service';
import { HotelStateService } from '../../../../../service/hotel-state.service';
import { ClientsService } from '../../../../../service/clients.service';
import { RoomsService } from '../../../../../service/rooms.service';
import { PagoReservaService } from '../../../../../service/pago-reserva.service';
import { ReservationsService } from '../../../../../service/reservations.service';
import { rooms } from '../interfaces/rooms.interface';
import { pago_reserva } from '../interfaces/pago_reserva.interface';
import { reservations } from '../interfaces/reservations.interface';
import { clients } from '../interfaces/clients.interface';

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  tokenId = Number(localStorage.getItem('token'));
  hotelId: any = null;
  hotels: any[] = [];
  clientsList: clients[] = [];
  roomsList: rooms[] = [];
  paymentsList: pago_reserva[] = [];
  reservationsList: reservations[] = [];
  selectedHotel: any = null;
  private hotelSubscription: Subscription = new Subscription();

  constructor(
    private AdminService: HotelAdminService,
    private hotelState: HotelStateService,
    private client: ClientsService,
    private room: RoomsService,
    private payment: PagoReservaService,
    private booking: ReservationsService
  ) {}

  ngOnInit() {
    this.hotelSubscription = this.hotelState.selectedHotel$.subscribe(hotel => {
      if (hotel) {
        this.hotelId = hotel.id;
        this.selectedHotel = hotel;
        localStorage.setItem('hotel', this.hotelId);
        this.getPayments();
        this.getReservations();
        this.getRooms();
        this.getClients();
      }
    });

    this.AdminService.findHotelsByAdmin(this.tokenId).subscribe({
      next: (data) => {
        this.hotels = data;
        if (this.hotels.length > 0 && !this.selectedHotel) {
          this.selectedHotel = this.hotels[0];
          this.hotelId = this.selectedHotel.id;
          localStorage.setItem('hotel', this.hotelId);
          this.hotelState.setSelectedHotel(this.selectedHotel);
          this.getPayments();
          this.getReservations();
          this.getRooms();
          this.getClients();
        }
      }
    });
  }

  ngOnDestroy() {
    this.hotelSubscription.unsubscribe();
  }

  selectHotel(hotel: any): void {
    this.hotelState.setSelectedHotel(hotel);
  }

  getClients() {
    if (this.hotelId) {
      this.client.findClients(this.tokenId).subscribe({
        next: (data) => {
          this.clientsList = data.filter(c => c.hotel_afiliado?.id === this.hotelId);
        },
        error: () => {
          this.clientsList = [];
        }
      });
    }
  }

getRooms() {
    if (this.hotelId) {
      this.room.getRoomByHotel(this.hotelId).subscribe({
        next: (data) => {
          this.roomsList = data;
        },
        error: () => {
          this.roomsList = [];
        }
      });
    }
  }

  getPayments() {
    this.payment.findAllByHotel(this.hotelId).subscribe({
      next: (data) => {
        this.paymentsList = data; 
      },
      error: () => {
        this.paymentsList = [];
      }
    });
  }

  getReservations() {
    this.booking.findByHotel(this.hotelId).subscribe({
      next: (data) => {
        this.reservationsList = data; 
      },
      error: () => {
        this.reservationsList = [];
      }
    });
  }


  calculateTotalBalance(): number {
    return this.paymentsList.reduce((total, payment) => total + Number(payment.amount), 0);
  }


  calculateBusyRooms(): number {
    return this.roomsList.filter(room => room.status === 'busy').length;
  }

  calculateFreeRooms(): number {
    return this.roomsList.filter(room => room.status === 'free').length;
  }

  calculateBookingRooms(): number {
    return this.roomsList.filter(room => room.status === 'booked').length;
  }

  
  calculateConfirmedPayments(): number {
    return this.paymentsList.filter(payment => payment.status === 'confirmed').length;
  }

  calculatePendingPayments(): number {
    return this.paymentsList.filter(payment => payment.status === 'pending').length;
  }

  calculateConfirmedReservations(): number {
    return this.reservationsList.filter(reservation => reservation.status === 'confirmed').length;
  }

  calculateCanceledReservations(): number {
    return this.reservationsList.filter(reservation => reservation.status === 'canceled').length;
  }

  calculateRefundedReservations(): number {
    return this.reservationsList.filter(reservation => reservation.status === 'refunded').length;
  }

  calculateTotalConfirmedBalance(): number {
    return this.paymentsList
      .filter(payment => payment.status === 'confirmed')
      .reduce((total, payment) => total + Number(payment.amount), 0);
  }
  
  
  
  getStatus(key: string): string {
    const value = localStorage.getItem(key);
    return value === 'true' ? 'Activo' : 'Inactivo';
  }
  
}
