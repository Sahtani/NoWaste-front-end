import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {Reservation} from '../../models/reservation/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  constructor(private http: HttpClient) { }

  createReservation(reservationRequest: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDash}/reservations/create`, reservationRequest);
  }

  getActiveReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${environment.apiUrlDash}/reservations/active`);
  }

  getUpcomingCollections(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${environment.apiUrlDash}/reservations/upcoming`);
  }

  getCollectionHistory(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${environment.apiUrlDash}/reservations/history`);
  }

  reserveItem(announcementId: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${environment.apiUrlDash}/reservations`, { announcementId });
  }

  cancelReservation(reservationId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrlDash}/reservations/${reservationId}`);
  }

  confirmCollection(reservationId: number): Observable<Reservation> {
    return this.http.put<Reservation>(`${environment.apiUrlDash}/reservations/${reservationId}/confirm`, {});
  }

  getReservationDetails(reservationId: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${environment.apiUrlDash}/reservations/${reservationId}`);
  }

  updatePickupTime(reservationId: number, pickupDate: Date): Observable<Reservation> {
    return this.http.put<Reservation>(`${environment.apiUrlDash}/reservations/${reservationId}/pickup`, { pickupDate });
  }
}
