import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { UpdateInfoModalComponent } from '@shared/components/modals/update-info-modal/update-info-modal.component';
import { ConfirmModalComponent } from '@shared/components/modals/confirm-modal/confirm-modal.component';
import { AuthStore } from '@core/store/auth.store';
import { AdminStore } from '@core/store/admin.store';

const MAX_IMAGE_SIZE_MB = 2;
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PsSvgIconComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private fb = inject(NonNullableFormBuilder);
  private modalService = inject(PsModalService);
  protected authStore = inject(AuthStore);
  protected adminStore = inject(AdminStore);

  /**
   * Pending, unsaved image state:
   *  - null → no change, keep whatever is currently saved
   *  - ''   → user removed the image, clear it on next save
   *  - base64 string → user picked a new image, send it on next save
   */
  pendingImage = signal<string | null>(null);
  imageError = signal<string | null>(null);

  currentUser = computed(() => this.authStore.user());

  displayImage = computed(() => {
    const pending = this.pendingImage();
    if (pending !== null) return pending || null; // '' -> removed
    return this.currentUser()?.profile_image ?? null;
  });

  profileForm = this.fb.group({
    firstname: [''],
    lastname: [''],
    email: [''],
    role: [''],
  });

  constructor() {
    // Keep the (readonly) form in sync with whoever is logged in
    effect(() => {
      const user = this.currentUser();
      if (!user) return;

      this.profileForm.patchValue({
        firstname: user.first_name ?? '',
        lastname: user.last_name ?? '',
        email: user.email ?? '',
        role: user.role?.name ?? '',
      });
    });
  }

  getInitials(): string {
    const first = this.profileForm.get('firstname')?.value?.charAt(0) ?? '';
    const last = this.profileForm.get('lastname')?.value?.charAt(0) ?? '';
    return (first + last).toUpperCase();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow picking the same file again later
    if (!file) return;

    this.imageError.set(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      this.imageError.set('Please upload a PNG, JPEG or WEBP image.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      this.imageError.set(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.pendingImage.set(reader.result as string);
    reader.onerror = () => this.imageError.set('Failed to read image. Please try again.');
    reader.readAsDataURL(file);
  }

  openRemoveImageModal(): void {
    if (!this.displayImage()) return;

    const user = this.currentUser();
    if (!user) return;

    this.modalService.open(ConfirmModalComponent, {
      maxWidth: '520px',
      isCentered: true,
      data: {
        title: 'Remove image?',
        description: 'Are you sure you want to remove this image? This action cannot be undone.',
        confirmButtonLabel: 'Yes, remove image',
        onConfirm: () => {
          this.removeImage(user.id);
        },
      },
    });
  }

  private removeImage(userId: string): void {
    this.adminStore.updateAdmin({
      id: userId,
      payload: { profile_image: null },
    });

    this.authStore.updateUser({ profile_image: null });
    this.pendingImage.set(null); // clear any pending state — this is now saved, not staged
  }
  openUpdateModal(): void {
    const user = this.currentUser();
    if (!user) return;

    this.modalService.open(UpdateInfoModalComponent, {
      maxWidth: '560px',
      isCentered: true,
      data: {
        firstname: this.profileForm.get('firstname')?.value,
        lastname: this.profileForm.get('lastname')?.value,
        hasPendingImageChange: this.pendingImage() !== null,
        onConfirm: (values: { firstname: string; lastname: string }) => {
          this.saveProfile(values);
        },
      },
    });
  }
  private saveProfile(values: { firstname: string; lastname: string }): void {
    const user = this.currentUser();
    if (!user) return;

    const pendingImage = this.pendingImage();
    const payload = {
      first_name: values.firstname,
      last_name: values.lastname,
      ...(pendingImage !== null ? { profile_image: pendingImage } : {}),
    };

    this.adminStore.updateAdmin({ id: user.id, payload });

    // Optimistically reflect in AuthStore too, since it's the same admin editing themselves
    this.authStore.updateUser(payload as any);
    this.pendingImage.set(null);
  }
}