import {Routes} from '@angular/router';
import {HomeComponent} from './features/home/components/home/home.component';
import {AnnouncementsDashboardComponent} from './features/announcements-dashboard/announcements-dashboard.component';
import {authGuard} from './core/guards/authentication/auth.guard';
import {LoginComponent} from './features/auth/login/login.component';
import {AnnouncementDetailsComponent} from './features/announcement-details/announcement-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/user-profile/user-profile.component').then(c => c.UserProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'donor/dashboard',
    component: AnnouncementsDashboardComponent,
    canActivate: [authGuard],
    data: {
      roles: ['DONOR']
    }
  },
/*  {
    path: 'announcements',
    component: AnnouncementsListComponent,
    canActivate: [authGuard],
    data: {
      roles: ['DONOR', 'BENEFICIARY']
    }
  },*/
  {
    path: 'announcements/:id',
    component: AnnouncementDetailsComponent,
    canActivate: [authGuard],
    data: {
      roles: ['DONOR', 'BENEFICIARY']
    }
  }


];
