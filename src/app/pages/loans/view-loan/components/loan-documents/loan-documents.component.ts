import { Component, inject, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PsSvgIconComponent } from "@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component";
import { LoanDetailDocument, LoanDetailGeneratedLetter } from '@core/interfaces/loan.model';
import { LoanStore } from '@core/store/loan.store';

@Component({
  selector: 'app-loan-documents',
  standalone: true,
  imports: [CommonModule, DatePipe, PsSvgIconComponent],
  templateUrl: './loan-documents.component.html',
})
export class LoanDocumentsComponent {
  readonly loanStore = inject(LoanStore);

  @Input({ required: true }) documents: LoanDetailDocument[] = [];
  @Input({ required: true }) generatedLetters: LoanDetailGeneratedLetter[] = [];

  get documentsApproved(): boolean { return this.documents.length > 0; }
  get letterGenerating(): boolean {
    return this.loanStore.letterGenerating();
  }
  generateLetter(type: 'indebtedness' | 'non_indebtedness'): void {
    this.loanStore.generateLetter(type);
  }

  viewFile(link: string): void { window.open(link, '_blank'); }

  downloadLetter(letter: LoanDetailGeneratedLetter): void {
    this.loanStore.downloadLetter(letter.id, `${letter.letterType}-${letter.reference}.pdf`);
  }
}