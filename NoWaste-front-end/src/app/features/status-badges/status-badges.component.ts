import { Component, Input } from '@angular/core';
import {NgFor, NgIf, NgClass, SlicePipe} from '@angular/common';
import {Product} from '../../core/models/product.model';

@Component({
  selector: 'app-status-badges',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, SlicePipe],
  template: `
    <div class="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
      <span *ngFor="let product of productList | slice:0:2"
            [ngClass]="{
              'from-green-400 to-green-500': product.status === 'AVAILABLE',
              'from-yellow-400 to-yellow-500': product.status === 'RESERVED',
              'from-blue-400 to-blue-500': product.status === 'UNAVAILABLE',
              'from-red-400 to-red-500': product.status === 'EXPIRED'
            }"
            class="text-xs font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm text-[#264653] bg-gradient-to-r transform group-hover:scale-105 transition-all">
        {{ product.status }}
      </span>

      <span *ngIf="productList && productList.length > 2"
            class="bg-[#264653]/20 text-[#264653] text-xs font-medium px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm transform group-hover:scale-105 transition-all">
        +{{ productList.length - 2 }} more
      </span>
    </div>
  `
})
export class StatusBadgesComponent {
  // Use getter/setter pattern to handle undefined input
  private _products: Product[] = [];

  @Input()
  set products(value: Product[] | undefined) {
    this._products = value || [];
  }

  get productList(): Product[] {
    return this._products;
  }
}
