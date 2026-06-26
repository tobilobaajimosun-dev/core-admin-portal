import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeedsAttentionComponent } from './needs-attention.component';

describe('NeedsAttentionComponent', () => {
  let component: NeedsAttentionComponent;
  let fixture: ComponentFixture<NeedsAttentionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeedsAttentionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NeedsAttentionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
