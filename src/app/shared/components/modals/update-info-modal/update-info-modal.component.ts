import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';

@Component({
  selector: 'app-update-info-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-info-modal.component.html',
  styleUrl: './update-info-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class UpdateInfoModalComponent extends PsModalComponent implements OnInit {

  private fb = inject(NonNullableFormBuilder);

  // Store originals to detect changes
  private originalFirstname = '';
  private originalLastname  = '';

  updateForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname:  ['', Validators.required],
  });

  get formControls(): { [key: string]: any } {
    return this.updateForm.controls;
  }

  ngOnInit(): void {
    // Pre-fill with current values passed from profile component
    const firstname = this.data?.['firstname'] ?? '';
    const lastname  = this.data?.['lastname']  ?? '';

    this.originalFirstname = firstname;
    this.originalLastname  = lastname;

    this.updateForm.patchValue({ firstname, lastname });
  }

  hasChanges(): boolean {
    const { firstname, lastname } = this.updateForm.getRawValue();
    return (
      firstname.trim() !== this.originalFirstname.trim() ||
      lastname.trim()  !== this.originalLastname.trim()
    );
  }

  handleSave(): void {
    if (this.updateForm.invalid || !this.hasChanges()) {
      this.updateForm.markAllAsTouched();
      return;
    }
    // TODO: call userService.updateProfile() with the new names
    console.log('Save info:', this.updateForm.getRawValue());
    this.close();
  }
}