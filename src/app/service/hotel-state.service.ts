import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelStateService {
  private selectedHotelSubject = new BehaviorSubject<any>(null);
  private hotelNameSubject = new BehaviorSubject<string>('');

  selectedHotel$ = this.selectedHotelSubject.asObservable();
  hotelName$ = this.hotelNameSubject.asObservable();

  setSelectedHotel(hotel: any): void {
    this.selectedHotelSubject.next(hotel);
    if (hotel) {
      this.hotelNameSubject.next(hotel.name || '');
    }
  }

  getSelectedHotel(): any {
    return this.selectedHotelSubject.getValue();
  }

  getHotelName(): string {
    return this.hotelNameSubject.getValue();
  }
}