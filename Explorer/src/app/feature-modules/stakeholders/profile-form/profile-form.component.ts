import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StakeholderService } from '../stakeholder.service';
import { Person } from '../model/person.model';
import { AccountRegistrationDto } from '../model/account-registration.dto';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.css']
})
export class ProfileFormComponent implements OnInit {
  profileForm: FormGroup;
  roles: string[] = ['Administrator', 'Author'];

  constructor(
    private fb: FormBuilder,
    private stakeholderService: StakeholderService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ProfileFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { person?: Person }
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data.person) {
      this.profileForm.patchValue({
        name: this.data.person.name,
        surname: this.data.person.surname,
        email: this.data.person.email,
        biography: this.data.person.biography,
        quote: this.data.person.quote,
        isActive: this.data.person.isActive,
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      biography: [''],
      quote: [''],
      role: ['', Validators.required],
      isActive: [true]
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.showError('Please fill in all required fields correctly');
      return;
    }

    const formValue = this.profileForm.getRawValue();

    const dto: AccountRegistrationDto = {
      username: formValue.username,
      password: formValue.password,
      role: formValue.role,
      name: formValue.name,
      surname: formValue.surname,
      email: formValue.email,
      biography: formValue.biography,
      quote: formValue.quote,
    };

    this.stakeholderService.createPerson(dto).subscribe({
      next: () => {
        this.showSuccess('Person created successfully');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        this.showError('Error creating person');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field) return '';
    if (field.hasError('required')) return 'This field is required';
    if (field.hasError('minlength')) return `Minimum length is ${field.errors?.['minlength'].requiredLength}`;
    if (field.hasError('email')) return 'Invalid email format';
    return '';
  }

  private showSuccess(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private showError(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}
