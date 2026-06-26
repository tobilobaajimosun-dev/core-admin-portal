import { Component } from '@angular/core';
import { CustomerStatsComponent } from './components/customer-stats/customer-stats.component';
import { NeedsAttentionComponent } from './components/needs-attention/needs-attention.component';
import { CustomersTableComponent } from './components/customers-table/customers-table.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CustomerStatsComponent,
    NeedsAttentionComponent,
    CustomersTableComponent,
  ],
  templateUrl: './customers.component.html',
})
export class CustomersComponent {}