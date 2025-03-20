import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HomeComponent} from './features/home/components/home/home.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'NoWaste-front-end';
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cdr.detach();

    setInterval(() => {
      this.cdr.detectChanges();
    }, 500);
  }
}
