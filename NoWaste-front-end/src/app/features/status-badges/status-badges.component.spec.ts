import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBadgesComponent } from './status-badges.component';

describe('StatusBadgesComponent', () => {
  let component: StatusBadgesComponent;
  let fixture: ComponentFixture<StatusBadgesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusBadgesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
