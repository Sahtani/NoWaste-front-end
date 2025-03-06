import {Routes} from '@angular/router';
import {HomeComponent} from './features/home/components/home/home.component';
import {AnnouncementsDashboardComponent} from './features/announcements-dashboard/announcements-dashboard.component';
import {authGuard} from './core/guards/authentication/auth.guard';
import {LoginComponent} from './features/auth/login/login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'announcements',
    component: AnnouncementsDashboardComponent}
  ,
   /* canActivate: [authGuard],
    data: {
      roles: ['DONOR', 'beneficiary']
    }
  }*/


];
