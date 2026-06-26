import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsSidebarComponent } from './ps-sidebar.component';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('PsSidebarComponent', () => {
  let component: PsSidebarComponent;
  let router: Router;
  let fixture: ComponentFixture<PsSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PsSidebarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsSidebarComponent);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
