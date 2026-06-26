import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PsSvgIconComponent } from "@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component";

export interface GeneratedLetter {
  dateGenerated: Date;
  letterType:    string;
}

@Component({
  selector: 'app-loan-documents',
  standalone: true,
  imports: [CommonModule, DatePipe, PsSvgIconComponent],
  templateUrl: './loan-documents.component.html',
})
export class LoanDocumentsComponent {
  readonly videoFile = {
    name:       'Video here',
    uploadedAt: new Date('2024-08-29T15:52:12'),
    format:     'MP4',
  };

  readonly offerLetter = {
    name:       'IMG749Q-3.pdf',
    uploadedAt: new Date('2024-08-29T15:52:12'),
    format:     'PDF',
  };

  readonly generatedLetters: GeneratedLetter[] = [
    { dateGenerated: new Date('2026-06-05'), letterType: 'Letter of non-indebtedness' },
  ];

  documentsApproved = true;

  generateLetter(type: string): void {
    console.log('Generate letter:', type);
  }

  viewFile(name: string): void {
    console.log('View file:', name);
  }

  downloadLetter(letter: GeneratedLetter): void {
    console.log('Download letter:', letter);
  }
}