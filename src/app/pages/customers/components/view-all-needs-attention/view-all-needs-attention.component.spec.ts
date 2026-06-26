import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllNeedsAttentionComponent } from './view-all-needs-attention.component';

describe('ViewAllNeedsAttentionComponent', () => {
  let component: ViewAllNeedsAttentionComponent;
  let fixture: ComponentFixture<ViewAllNeedsAttentionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllNeedsAttentionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewAllNeedsAttentionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
