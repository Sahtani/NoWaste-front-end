import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import {UserStats} from '../../../core/models/user/user.model';
import {UserStatsService} from '../../../core/services/user/user-stats.service';
import {NotificationService} from '../../../core/services/notification/notification.service';
import {AuthService} from '../../../core/services/authentication/auth.service';
import {Reservation} from '../../../core/models/reservation/reservation.model';
import {ReservationService} from '../../../core/services/reservation/reservation.service';
import {NotificationData} from '../../../core/models/notification.model';
import {HeaderComponent} from '../../../layout/header/header.component';



interface Message {
  id: number;
  senderName: string;
  senderAvatar?: string;
  preview: string;
  time: Date;
  read: boolean;
}

interface ChatMessage {
  id: number;
  text: string;
  time: Date;
  isFromMe: boolean;
}

@Component({
  selector: 'app-beneficiary-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './beneficiary-dashboard.component.html',
  styleUrls: ['./beneficiary-dashboard.component.css']
})
export class BeneficiaryDashboardComponent implements OnInit {

  isLoading = false;

  activeTab = 'active';

  reservations: Reservation[] = [];
  upcomingCollections: Reservation[] = [];
  collectionHistory: Reservation[] = [];

  messages: Message[] = [];

  showChatModal = false;
  selectedChat: any = null;
  chatMessages: ChatMessage[] = [];
  newMessage = '';

  constructor(
    private userStatsService: UserStatsService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }



  loadReservations(): void {
    this.reservationService.getActiveReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.notificationService.error('Failed to load reservations');
      }
    });

    this.reservationService.getUpcomingCollections().subscribe({
      next: (collections) => {
        this.upcomingCollections = collections;
      },
      error: (error) => {
        console.error('Error loading upcoming collections:', error);
      }
    });

    // Chargez l'historique des collectes
    this.reservationService.getCollectionHistory().subscribe({
      next: (history) => {
        this.collectionHistory = history;
      },
      error: (error) => {
        console.error('Error loading collection history:', error);
      }
    });
  }



  viewDetails(reservation: Reservation): void {

    this.notificationService.info(`Viewing details for ${reservation.title}`);
  }




  handleLogin(): void {
    // Implement login logic
  }

  handleSignup(): void {
    // Implement signup logic
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

}
