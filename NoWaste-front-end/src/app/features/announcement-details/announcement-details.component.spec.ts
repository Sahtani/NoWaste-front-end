import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementDetailsComponent } from './announcement-details.component';

describe('AnnouncementDetailsComponent', () => {
  let component: AnnouncementDetailsComponent;
  let fixture: ComponentFixture<AnnouncementDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnouncementDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
