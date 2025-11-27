import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../account.service';
import { AccountDto, AccountCreateDto } from '../model/account.model';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.css']
})
export class AccountFormComponent implements OnInit {
  accountForm: FormGroup;
  isEditMode: boolean = false;
  accountId?: number;
  roles: string[] = ['Admin', 'Author'];

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AccountFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', account?: AccountDto }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.accountForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.account) {
      this.accountId = this.data.account.id;
      this.accountForm.patchValue({
        username: this.data.account.username,
        email: this.data.account.email,
        role: this.data.account.role
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      this.markFormGroupTouched(this.accountForm);
      this.showError('Please fill in all required fields correctly');
      return;
    }

    const formValue = this.accountForm.getRawValue();

    if (this.isEditMode && this.accountId) {
      // For simplicity, assuming edit does not allow password change
      const updateDto: AccountCreateDto = {
        username: formValue.username,
        email: formValue.email,
        password: '', // leave empty if password not editable
        role: formValue.role
      };

      this.accountService.createAccount(updateDto).subscribe({
        next: () => {
          this.showSuccess('Account successfully updated');
          this.dialogRef.close(true);
        },
        error: () => {
          this.showError('Error updating account');
        }
      });
    } else {
      const createDto: AccountCreateDto = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        role: formValue.role
      };

      this.accountService.createAccount(createDto).subscribe({
        next: () => {
          this.showSuccess('Account successfully created');
          this.dialogRef.close(true);
        },
        error: () => {
          this.showError('Error creating account');
        }
      });
    }
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

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.accountForm.get(fieldName);

    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('minlength')) return `Minimum length is ${field.errors?.['minlength'].requiredLength}`;
    if (field?.hasError('maxlength')) return `Maximum length is ${field.errors?.['maxlength'].requiredLength}`;
    if (field?.hasError('email')) return 'Invalid email format';

    return '';
  }
}
