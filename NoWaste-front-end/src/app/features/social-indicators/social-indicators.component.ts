import { Component } from '@angular/core';

@Component({
  selector: 'app-social-indicators',
  standalone: true,
  template: `
    <div class="absolute bottom-3 left-3 z-10 flex items-center">
      <div class="flex -space-x-2">
        <div class="w-6 h-6 rounded-full border-2 border-[#264653] overflow-hidden bg-gray-200"></div>
        <div class="w-6 h-6 rounded-full border-2 border-[#264653] overflow-hidden bg-gray-200"></div>
        <div class="w-6 h-6 rounded-full border-2 border-[#264653] overflow-hidden bg-gray-200"></div>
      </div>
      <button class="ml-2 bg-[#264653]/10 backdrop-blur-sm rounded-full p-1.5 text-[#264653] hover:bg-[#264653]/20 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
        </svg>
      </button>
      <span class="ml-1 text-[#264653] text-sm font-medium">125</span>
    </div>
  `
})
export class SocialIndicatorsComponent {}
