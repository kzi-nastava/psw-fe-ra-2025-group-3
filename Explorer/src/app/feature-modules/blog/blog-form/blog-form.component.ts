import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlogService } from '../blog.service';
import { Blog, BlogCreateDto, BlogUpdateDto, BlogImageCreateDto } from '../model/blog.model';

@Component({
  selector: 'app-blog-form',
  templateUrl: './blog-form.component.html',
  styleUrls: ['./blog-form.component.css']
})
export class BlogFormComponent implements OnInit {
  blogForm: FormGroup;
  isEditMode: boolean = false;
  blogId?: number;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<BlogFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', blog?: Blog }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.blogForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.blog) {
      this.blogId = this.data.blog.id;
      this.blogForm.patchValue({
        title: this.data.blog.title,
        description: this.data.blog.description
      });

      // Popuni postojeće slike
      this.data.blog.images.forEach(img => {
        this.addImage(img.imageUrl);
      });
    } else {
      // Za novi blog, dodaj jedno prazno polje za sliku
      this.addImage();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10000)]],
      images: this.fb.array([])
    });
  }

  get images(): FormArray {
    return this.blogForm.get('images') as FormArray;
  }

  addImage(url: string = ''): void {
    if (this.images.length < 10) {
      const imageGroup = this.fb.group({
        imageUrl: [url, [Validators.required, Validators.pattern('https?://.+')]]
      });
      this.images.push(imageGroup);
    } else {
      this.showError('Maximum 10 images allowed');
    }
  }

  removeImage(index: number): void {
    if (this.images.length > 1 || this.isEditMode) {
      this.images.removeAt(index);
    } else {
      this.showError('At least one image is required');
    }
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      this.markFormGroupTouched(this.blogForm);
      this.showError('Please fill in all required fields correctly');
      return;
    }

    const formValue = this.blogForm.value;
    const imageUrls: BlogImageCreateDto[] = formValue.images
      .filter((img: any) => img.imageUrl && img.imageUrl.trim() !== '')
      .map((img: any) => ({ imageUrl: img.imageUrl }));

    if (this.isEditMode && this.blogId) {
      const updateDto: BlogUpdateDto = {
        title: formValue.title,
        description: formValue.description,
        images: imageUrls
      };

      this.blogService.updateBlog(this.blogId, updateDto).subscribe({
        next: () => {
          this.showSuccess('Blog successfully updated');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating blog:', error);
          this.showError(error.error?.errors?.Description?.[0] || 'Error updating blog');
        }
      });
    } else {
      const createDto: BlogCreateDto = {
        title: formValue.title,
        description: formValue.description,
        images: imageUrls
      };

      this.blogService.createBlog(createDto).subscribe({
        next: () => {
          this.showSuccess('Blog successfully created');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating blog:', error);
          this.showError(error.error?.errors?.Description?.[0] || 'Error creating blog');
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string, index?: number): string {
    let field;
    
    if (index !== undefined) {
      field = this.images.at(index).get(fieldName);
    } else {
      field = this.blogForm.get(fieldName);
    }
    
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    
    if (field?.hasError('pattern')) {
      return 'Please enter a valid URL (http:// or https://)';
    }
    
    return '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          }
        });
      }
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
}