import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialIndicatorsComponent } from './social-indicators.component';

describe('SocialIndicatorsComponent', () => {
  let component: SocialIndicatorsComponent;
  let fixture: ComponentFixture<SocialIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialIndicatorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
