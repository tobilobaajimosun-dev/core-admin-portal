// ps-pagination.component.ts
import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  effect,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PsSelectModule } from '@pcsl-ui/ui/ps-select/ps-select.module';
import { DynamicObjectType } from '@pcsl-ui/utils/types';

@Component({
  selector: 'ps-pagination',
  templateUrl: './ps-pagination.component.html',
  styleUrls: ['./ps-pagination.component.scss'],
  standalone: true,
  imports: [PsSelectModule, FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsPaginationComponent {
  totalItems = input.required<number>();
  itemPerPage = model<number>(20);
  pageChanged = output<number>();
  pageSizeChanged = output<number>();

  // Page size options & selection (mirrors first component)
  readonly pageSizeOptions = signal([5, 10, 20, 50, 100]);
  readonly selectedPageSize = signal<number>(20);

  overflowLeft = signal(false);
  overflowRight = signal(false);
  page1 = signal(1);
  page2 = signal(2);
  page3 = signal(3);
  page4 = signal(4);
  page5 = signal(5);
  page6 = signal(6);
  page7 = signal(7);
  currentPage = model(1);
  
  // Computed properties for "Showing X to Y of Z" text
  itemsFrom = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.itemPerPage() + 1;
  });

  itemsEnd = computed(() => {
    const end = this.currentPage() * this.itemPerPage();
    return Math.min(end, this.totalItems());
  });

  largestPageNumber = computed(() => {
    return Math.ceil(this.totalItems() / this.itemPerPage());
  });

  _totalItems = 1;

  isNextButtonDisabled = computed(() => {
    return this.currentPage() === this.largestPageNumber();
  });

  isPreviousButtonDisabled = computed(() => {
    return this.currentPage() === 1;
  });

  constructor() {
    // Keep selectedPageSize in sync with itemPerPage model
    effect(
      () => {
        this.selectedPageSize.set(this.itemPerPage());
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        this.updatePageNumbers();
      },
      { allowSignalWrites: true }
    );
  }

  updatePageNumbers() {
    const largest = Math.ceil(this.totalItems() / this.itemPerPage());
    this.page7.set(largest);

    if (this.currentPage() === 1) {
      this.page1.set(1);
      this.page2.set(2);
      this.page3.set(3);
      this.page4.set(4);
      this.page5.set(5);
      this.page6.set(6);
      this.overflowLeft.set(false);
      this.overflowRight.set(largest > 7);
      return;
    }

    if (largest > 7) {
      this.overflowLeft.set(false);
      this.overflowRight.set(true);
    } else if (largest < 6) {
      this.overflowLeft.set(false);
      this.overflowRight.set(false);
    } else {
      this.overflowRight.set(false);
      this.overflowLeft.set(false);
    }
  }

  paginate(page: number, pageButtonClicked: number): void {
    if (this.currentPage() == page) return;
    if (page < 6) {
      this.overflowRight.set(true);
      this.overflowLeft.set(false);
    } else if (page >= 6) {
      this.overflowRight.set(true);
      this.overflowLeft.set(true);
    }
    this.changeOverFlowPages(page, pageButtonClicked);
    this.currentPage.set(page);
    this.pageChanged.emit(this.currentPage());
  }

  changeOverFlowPages(pageClicked: number, pageButtonClicked: number) {
    let offset = 0;
    switch (pageButtonClicked) {
      case 2:
        offset = -2;
        break;
      case 3:
        offset = -1;
        break;
      case 5:
        offset = 1;
        break;
      case 6:
        offset = 2;
        break;
    }
    if (
      ((6 >= this.page2() && !this.overflowLeft() && pageButtonClicked != 7) ||
        pageClicked == 1) &&
      this.largestPageNumber() > 6
    ) {
      this.overflowRight.set(true);
      this.page2.set(2);
      this.page3.set(3);
      this.page4.set(4);
      this.page5.set(5);
      this.page6.set(6);
      return;
    }
    if (
      (this.page6() + offset >= this.largestPageNumber() - 2 &&
        pageButtonClicked != 2 &&
        this.largestPageNumber() > 6) ||
      pageButtonClicked == 7
    ) {
      this.overflowRight.set(false);
      this.page2.set(this.largestPageNumber() - 5);
      this.page3.set(this.largestPageNumber() - 4);
      this.page4.set(this.largestPageNumber() - 3);
      this.page5.set(this.largestPageNumber() - 2);
      this.page6.set(this.largestPageNumber() - 1);
      return;
    }
    if (this.largestPageNumber() < 7) {
      this.overflowRight.set(false);
      this.overflowLeft.set(false);
      return;
    }
    this.page2.set(this.page2() + offset);
    this.page3.set(this.page3() + offset);
    this.page4.set(this.page4() + offset);
    this.page5.set(this.page5() + offset);
    this.page6.set(this.page6() + offset);
  }

  moveBackward(): void {
    if (this.isPreviousButtonDisabled()) return;
    let newPage = this.currentPage() - 1;
    if (this.currentPage() <= 6) {
      this.paginate(newPage, newPage);
    } else if (this.currentPage() == this.largestPageNumber() - 4) {
      this.paginate(newPage, 2);
    } else this.paginate(newPage, 3);
  }

 moveForward(): void {
  if (this.isNextButtonDisabled()) return;
  let newPage = this.currentPage() + 1;
  if (newPage <= 6) {
    this.paginate(newPage, newPage);  
  } else if (this.currentPage() == this.largestPageNumber() - 1) {
    this.paginate(newPage, this.largestPageNumber() - this.currentPage() - 6); 
  } else this.paginate(newPage, 5);
}

  onPageSizeChange(value: number | string | DynamicObjectType | null): void {
    if (typeof value === 'number') {
      this.changePageSize(value);
    }
  }

  changePageSize(page_size: number): void {
    this.page1.set(1);
    this.page2.set(2);
    this.page3.set(3);
    this.page4.set(4);
    this.page5.set(5);
    this.page6.set(6);

    this.itemPerPage.set(page_size);
    this.selectedPageSize.set(page_size);
    this.page7.set(this.largestPageNumber());
    this.updatePageNumbers();
    this.currentPage.set(1);
    this.pageSizeChanged.emit(page_size);
    this.pageChanged.emit(1);
  }
}