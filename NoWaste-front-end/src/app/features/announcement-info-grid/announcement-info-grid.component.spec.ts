import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementInfoGridComponent } from './announcement-info-grid.component';

describe('AnnouncementInfoGridComponent', () => {
  let component: AnnouncementInfoGridComponent;
  let fixture: ComponentFixture<AnnouncementInfoGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementInfoGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnouncementInfoGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
