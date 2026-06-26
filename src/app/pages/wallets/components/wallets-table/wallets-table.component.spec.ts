import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletsTableComponent } from './wallets-table.component';

describe('WalletsTableComponent', () => {
  let component: WalletsTableComponent;
  let fixture: ComponentFixture<WalletsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WalletsTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
