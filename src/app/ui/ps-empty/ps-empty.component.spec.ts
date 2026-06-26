import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsEmptyComponent } from './ps-empty.component';

describe('PsEmptyComponent', () => {
  let component: PsEmptyComponent;
  let fixture: ComponentFixture<PsEmptyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PsEmptyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
