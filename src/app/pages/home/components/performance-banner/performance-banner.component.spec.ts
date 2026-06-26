import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceBannerComponent } from './performance-banner.component';

describe('PerformanceBannerComponent', () => {
  let component: PerformanceBannerComponent;
  let fixture: ComponentFixture<PerformanceBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PerformanceBannerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
