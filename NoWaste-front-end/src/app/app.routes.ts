import {Routes} from '@angular/router';
import {HomeComponent} from './features/home/components/home/home.component';
import {AnnouncementsDashboardComponent} from './features/announcements-dashboard/announcements-dashboard.component';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'announcements',
    component: AnnouncementsDashboardComponent,
    canActivate: [authGuard],
    data: {
      roles: ['donor', 'beneficiary']
    }
  }


];
