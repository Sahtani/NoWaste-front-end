
import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {User} from '../../../core/models/user/user.model';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css']
})
export class ProfileInfoComponent {
  @Input() user: User | null = null;
}
