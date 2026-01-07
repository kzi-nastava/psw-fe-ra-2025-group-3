import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KeyPoint } from '../model/key-point.model';
import { KeyPointService } from '../key-point.service';

@Component({
  selector: 'xp-key-point-form',
  templateUrl: './key-point-form.component.html',
  styleUrls: ['./key-point-form.component.css']
})
export class KeyPointFormComponent implements OnInit {

  @Input() isEditMode: boolean = false;
  @Input() keyPoint: KeyPoint | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  keyPointForm!: FormGroup;

  preview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private keyPointService: KeyPointService
  ) {}


  ngOnInit(): void {
    this.keyPointForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      imageUrl: ['', [Validators.required]],
      secret: ['', [Validators.required]],
    });
  }

  get name() { return this.keyPointForm.get('name'); }
  get description() { return this.keyPointForm.get('description'); }
  get imageUrl() { return this.keyPointForm.get('imageUrl'); }
  get secret() { return this.keyPointForm.get('secret'); }

  onSubmit(): void {
    if (this.keyPointForm.invalid) {
      this.keyPointForm.markAllAsTouched();
      return;
    }

    this.save.emit(this.keyPointForm.value);
    this.preview = null;
  }

  onCancel(): void {
    this.cancel.emit();
    this.preview = null;
  }

  resetForm() {
    this.keyPointForm.reset();
    this.preview = null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.keyPointForm) return;

    if (changes['keyPoint']) {
      if (this.keyPoint) {
        // EDIT mod – popuni formu
        this.keyPointForm.patchValue({
          name: this.keyPoint.name,
          description: this.keyPoint.description,
          imageUrl: this.keyPoint.imageUrl,
          secret: this.keyPoint.secret
          // koordinate NE diramo ovde – njih rešava mapa
        });
          this.preview = this.keyPoint.imageUrl;
      } else {
        // Izašli smo iz edit moda – reset
        this.keyPointForm.reset();
        this.preview = null;
      }
    }
  }

  dragActive = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent) {
    this.dragActive = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragActive = false;

    this.imageUrl?.markAsTouched();
    this.imageUrl?.updateValueAndValidity();

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  processFile(file: File) {
    this.keyPointService.uploadImage(file).subscribe({
      next: (res) => {
        this.preview = res.imageUrl;
        this.keyPointForm.patchValue({
          imageUrl: res.imageUrl
        });
      }
    });
  }

  removeImage(event: Event) {
    event.stopPropagation();  

    this.imageUrl?.markAsTouched();
    this.imageUrl?.updateValueAndValidity();

    const fileName = this.keyPointForm.value.imageUrl?.split("/")?.pop();

    if (!fileName) {
      this.preview = null;
      this.keyPointForm.patchValue({ imageUrl: '' });
      this.imageUrl?.markAsTouched();
      this.imageUrl?.updateValueAndValidity();
      return;
    }

    this.keyPointService.deleteImage(fileName).subscribe({
      next: () => {
        this.preview = null;
        this.keyPointForm.patchValue({ imageUrl: '' });
        this.imageUrl?.markAsTouched();
        this.imageUrl?.updateValueAndValidity();
      },
      error: () => {
        this.preview = null;
        this.keyPointForm.patchValue({ imageUrl: '' });
        this.imageUrl?.markAsTouched();
        this.imageUrl?.updateValueAndValidity();
      }
    });
  }

}
