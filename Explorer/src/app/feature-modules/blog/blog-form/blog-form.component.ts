// src/app/feature-modules/blog/blog-form/blog-form.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlogService } from '../blog.service';
import { Blog, BlogCreateDto, BlogUpdateDto, BlogImageCreateDto, BlogStatus } from '../model/blog.model';

interface ImageItem {
  type: 'url' | 'file';
  url?: string;
  file?: File;
  fileName?: string;
  uploading?: boolean;
  uploadedUrl?: string;
  preview?: string;
  loaded?: boolean;
}

@Component({
  selector: 'app-blog-form',
  templateUrl: './blog-form.component.html',
  styleUrls: ['./blog-form.component.css']
})
export class BlogFormComponent implements OnInit {
  blogForm: FormGroup;
  isEditMode: boolean = false;
  blogId?: number;
  blogStatus: BlogStatus = BlogStatus.Draft; //  Novo
  imageItems: ImageItem[] = [];
  isDragging = false;

  // Novo - Provere permisija
  canEditTitle: boolean = true;
  canEditImages: boolean = true;

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
      this.blogStatus = this.data.blog.status; // Novo

      // Proveri permisije
      this.canEditTitle = this.blogService.canEditTitle(this.blogStatus);
      this.canEditImages = this.blogService.canEditImages(this.blogStatus);

      this.blogForm.patchValue({
        title: this.data.blog.title,
        description: this.data.blog.description
      });

      //  Disable polja ako ne mogu da se edituju
      if (!this.canEditTitle) {
        this.blogForm.get('title')?.disable();
      }

      // Učitaj postojeće slike
      this.data.blog.images.forEach(img => {
        this.imageItems.push({
          type: 'url',
          url: img.imageUrl,
          uploadedUrl: img.imageUrl
        });
        this.addImageToFormArray(img.imageUrl);
      });
    } else {
      this.addEmptyImageField();
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

  //  Helper za prikaz statusa
  getStatusLabel(): string {
    return this.blogService.getStatusLabel(this.blogStatus);
  }

  onDragOver(event: DragEvent): void {
    if (!this.canEditImages) return; //  Blokiraj ako nije dozvoljeno
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    if (!this.canEditImages) return; // Blokiraj ako nije dozvoljeno
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onUrlError(item: any) {
    item.url = 'https://via.placeholder.com/200x150?text=Invalid+URL';
  }

  onUrlLoad(item: any) {
    item.loaded = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  handleFiles(files: File[]): void {
    if (!this.canEditImages) {
      this.showError('Images cannot be changed for this blog status');
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      this.showError('Please select valid image files');
      return;
    }

    if (this.imageItems.length + imageFiles.length > 10) {
      this.showError('Maximum 10 images allowed');
      return;
    }

    imageFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        this.showError(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageItem: ImageItem = {
          type: 'file',
          file: file,
          fileName: file.name,
          preview: e.target.result,
          uploading: false
        };
        this.imageItems.push(imageItem);
        this.addImageToFormArray('');
      };
      reader.readAsDataURL(file);
    });
  }

  addUrlImage(): void {
    if (!this.canEditImages) {
      this.showError('Images cannot be changed for this blog status');
      return;
    }
    if (this.imageItems.length >= 10) {
      this.showError('Maximum 10 images allowed');
      return;
    }
    this.addEmptyImageField();
  }

  addEmptyImageField(): void {
    this.imageItems.push({ type: 'url', url: '' });
    this.addImageToFormArray('');
  }

  addImageToFormArray(url: string): void {
    const imageGroup = this.fb.group({
      imageUrl: [url, url ? [Validators.pattern('https?://.+')] : []]
    });
    this.images.push(imageGroup);
  }

  removeImage(index: number): void {
    if (!this.canEditImages) {
      this.showError('Images cannot be changed for this blog status');
      return;
    }
    if (this.imageItems.length === 1 && !this.isEditMode) {
      this.showError('At least one image field is required');
      return;
    }

    this.imageItems.splice(index, 1);
    this.images.removeAt(index);
  }

  updateUrlInFormArray(index: number, url: string): void {
    const imageControl = this.images.at(index);
    imageControl.patchValue({ imageUrl: url });
    imageControl.get('imageUrl')?.setValidators([Validators.pattern('https?://.+')]);
    imageControl.get('imageUrl')?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    //  Validacija na osnovu statusa
    if (this.isEditMode && !this.canEditTitle) {
      // Ako ne može da edituje title, ukloni ga iz validacije
      this.blogForm.get('title')?.clearValidators();
      this.blogForm.get('title')?.updateValueAndValidity();
    }

    if (this.blogForm.invalid) {
      this.markFormGroupTouched(this.blogForm);
      this.showError('Please fill in all required fields correctly');
      return;
    }

    try {
      // Upload slika (samo ako mogu da se menjaju)
      if (this.canEditImages) {
        for (let i = 0; i < this.imageItems.length; i++) {
          const item = this.imageItems[i];
          if (item.type === 'file' && item.file && !item.uploadedUrl) {
            item.uploading = true;
            try {
              const response = await this.blogService.uploadImage(item.file).toPromise();
              item.uploadedUrl = response!.imageUrl;
              item.fileName = response!.fileName;
              this.updateUrlInFormArray(i, response!.imageUrl);
            } catch (error) {
              console.error('Error uploading image:', error);
              this.showError(`Failed to upload ${item.fileName}`);
              return;
            } finally {
              item.uploading = false;
            }
          } else if (item.type === 'url' && item.url) {
            this.updateUrlInFormArray(i, item.url);
          }
        }
      }

      // Pripremi slike za slanje
      const imageUrls: BlogImageCreateDto[] = this.imageItems
        .map((item) => {
          if (item.type === 'file' && item.uploadedUrl) {
            return { imageUrl: item.uploadedUrl };
          } else if (item.type === 'url' && item.url && item.url.trim() !== '') {
            return { imageUrl: item.url };
          }
          return null;
        })
        .filter(img => img !== null) as BlogImageCreateDto[];

      const formValue = this.blogForm.getRawValue(); // getRawValue da dobije i disabled polja

      if (this.isEditMode && this.blogId) {
        const updateDto: BlogUpdateDto = {
          title: formValue.title,
          description: formValue.description,
          images: this.canEditImages ? imageUrls : this.data.blog!.images.map(img => ({ imageUrl: img.imageUrl }))
        };

        this.blogService.updateBlog(this.blogId, updateDto).subscribe({
          next: () => {
            this.showSuccess('Blog successfully updated');
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error updating blog:', error);
            this.showError(error.error || 'Error updating blog');
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
            this.showError(error.error || 'Error creating blog');
          }
        });
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      this.showError('An error occurred while processing your request');
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.blogForm.get(fieldName);
    
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