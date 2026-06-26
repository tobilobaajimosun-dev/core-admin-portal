import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsMastHeadComponent } from './ps-mast-head.component';

describe('PsMastHeadComponent', () => {
  let component: PsMastHeadComponent;
  let fixture: ComponentFixture<PsMastHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PsMastHeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsMastHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
