import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PsSvgIconComponent } from "@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component";
import { LoanDetailDocument, LoanDetailGeneratedLetter } from '@core/interfaces/loan.model';

@Component({
  selector: 'app-loan-documents',
  standalone: true,
  imports: [CommonModule, DatePipe, PsSvgIconComponent],
  templateUrl: './loan-documents.component.html',
})
export class LoanDocumentsComponent {
  @Input({ required: true }) documents: LoanDetailDocument[] = [];
  @Input({ required: true }) generatedLetters: LoanDetailGeneratedLetter[] = [];

  get documentsApproved(): boolean { return this.documents.length > 0; }

  generateLetter(type: string): void { console.log('Generate letter:', type); }
  viewFile(link: string): void { window.open(link, '_blank'); }
  downloadLetter(letter: LoanDetailGeneratedLetter): void { console.log('Download letter:', letter); }
}