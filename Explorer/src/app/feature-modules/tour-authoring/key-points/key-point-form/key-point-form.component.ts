import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KeyPoint } from '../model/key-point.model';

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

  constructor(private fb: FormBuilder) { }

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
  }

  onCancel(): void {
    this.cancel.emit();
  }

  resetForm() {
    this.keyPointForm.reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
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
      } else {
        // Izašli smo iz edit moda – reset
        this.keyPointForm.reset();
      }
    }
  }

}
