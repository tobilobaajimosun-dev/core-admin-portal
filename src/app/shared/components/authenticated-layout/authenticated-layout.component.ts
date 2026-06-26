import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { PsMastHeadComponent } from 'src/app/ui/ps-mast-head/ps-mast-head.component';
import { PsSidebarComponent } from 'src/app/ui/ps-sidebar/ps-sidebar.component';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, PsMastHeadComponent, PsSidebarComponent],
  templateUrl: './authenticated-layout.component.html',
  styleUrl: './authenticated-layout.component.scss'
})
export class AuthenticatedLayoutComponent {
}
