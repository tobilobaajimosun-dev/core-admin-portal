import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn } from "@angular/forms";

export class Utils {
  public static markAllControlsAsDirty(abstractControls: AbstractControl[]): void {
    abstractControls.forEach(abstractControl => {
      if (abstractControl instanceof FormControl) {
        (abstractControl as FormControl).markAsDirty();
        (abstractControl as FormControl).updateValueAndValidity({ onlySelf: true });
      } else if (abstractControl instanceof FormGroup) {
        this.markAllControlsAsDirty(Object.values((abstractControl as FormGroup).controls));
      } else if (abstractControl instanceof FormArray) {
        this.markAllControlsAsDirty((abstractControl as FormArray).controls);
      }
    });
  }

  telephoneValidator = (control: AbstractControl): { [s: string]: boolean } => {
    const value = control.value;
    if (value) {
      if (!this.isMobile(value)) {
        return { invalid: true };
      }
    }
    return {}
  }

  /**
   * Check if a given value is a valid mobile phone number.
   * Mobile numbers should be of the form 07xxxxxxxx or 08xxxxxxxx.
   * @param value The value to check.
   * @returns True if the value is a valid mobile phone number, false otherwise.
   */
  isMobile(value: string): boolean {
    return typeof value === 'string' && /((^0)(7|8|9){1}(0|1){1}[0-9]{8}$)/.test(value);
  }

  confirmationValidator = (formInputValue: string) => (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== formInputValue) {
      return { confirm: true, error: true };
    }
    return {};
  }

  strongPasswordRegx: RegExp = /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;


// Helper function to check if control has 'required' validator
public static hasValidator(control: AbstractControl, validator: ValidatorFn): boolean {
  const controlValidators = control.validator ? control.validator({} as AbstractControl) : null;
  if (controlValidators) {
    return !!control.validator && control.validator({} as AbstractControl)?.[validator.name];
  }
  return false;
}
}
