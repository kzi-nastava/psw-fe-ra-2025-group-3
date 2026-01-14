import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KeyPoint } from '../model/key-point.model';
import { KeyPointService } from '../key-point.service';
import { EncounterStatus, EncounterType } from 'src/app/feature-modules/administration/model/encounter.model';


@Component({
  selector: 'xp-key-point-form',
  templateUrl: './key-point-form.component.html',
  styleUrls: ['./key-point-form.component.css']
})
export class KeyPointFormComponent implements OnInit, OnChanges {

  @Input() isEditMode: boolean = false;
  @Input() keyPoint: KeyPoint | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  EncounterStatus = EncounterStatus;
  EncounterType = EncounterType;

  encounterTypes = [
    { value: EncounterType.Misc, label: 'Misc' },
    { value: EncounterType.Social, label: 'Social' },
    { value: EncounterType.HiddenLocation, label: 'Hidden Location' }
  ];

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

      hasEncounter: [false],

      encounter: this.fb.group({
        name: [''],
        description: [''],
        xp: [null],
        type: [''],
        actionDescription: [''],
        requiredPeopleCount: [null],
        rangeInMeters: [null],
        imageUrl: [''], // hint image (HiddenLocation)
        isMandatory: [false]
      })
    });
    this.toggleEncounter(false);

    this.hasEncounter?.valueChanges.subscribe((enabled: boolean) => {
      this.toggleEncounter(enabled);
    });

    this.eType?.valueChanges.subscribe((type: EncounterType) => {
      if (this.hasEncounter?.value) {
        this.updateValidatorsForType(type);
      }
    });
  }

  get name() { return this.keyPointForm.get('name'); }
  get description() { return this.keyPointForm.get('description'); }
  get imageUrl() { return this.keyPointForm.get('imageUrl'); }
  get secret() { return this.keyPointForm.get('secret'); }
  get hasEncounter() { return this.keyPointForm.get('hasEncounter'); }
  get encounterGroup() { return this.keyPointForm.get('encounter') as FormGroup; }

  get eName() { return this.encounterGroup.get('name'); }
  get eDescription() { return this.encounterGroup.get('description'); }
  get eXp() { return this.encounterGroup.get('xp'); }
  get eType() { return this.encounterGroup.get('type'); }

  get eActionDescription() { return this.encounterGroup.get('actionDescription'); }
  get eRequiredPeopleCount() { return this.encounterGroup.get('requiredPeopleCount'); }
  get eRangeInMeters() { return this.encounterGroup.get('rangeInMeters'); }
  get eImageUrl() { return this.encounterGroup.get('imageUrl'); }
  get eIsMandatory() { return this.encounterGroup.get('isMandatory'); }

  onSubmit(): void {
    if (this.keyPointForm.invalid) {
      this.keyPointForm.markAllAsTouched();
      return;
    }

    const raw = this.keyPointForm.getRawValue();

    const payload: any = {
      name: raw.name,
      description: raw.description,
      imageUrl: raw.imageUrl,
      secret: raw.secret
    };

    if (raw.hasEncounter) {
      const e = raw.encounter;
      const encounterType = e.type as EncounterType;

      const encounterData: any = {
        name: e.name,
        description: e.description,
        xp: e.xp,
        status: EncounterStatus.PendingApproval, // autor šalje na odobrenje
        type: encounterType,
        isMandatory: e.isMandatory ?? false
      };

      if (encounterType === EncounterType.Misc) {
        encounterData.actionDescription = e.actionDescription;
      } else if (encounterType === EncounterType.Social) {
        encounterData.requiredPeopleCount = e.requiredPeopleCount;
        encounterData.rangeInMeters = e.rangeInMeters;
      } else if (encounterType === EncounterType.HiddenLocation) {
        encounterData.imageUrl = e.imageUrl;
      }

      payload.encounter = encounterData;
    } else {
      payload.encounter = null;
    }

    this.save.emit(payload);
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
        // EDIT mode – populate KeyPoint fields
        this.keyPointForm.patchValue({
          name: this.keyPoint.name,
          description: this.keyPoint.description,
          imageUrl: this.keyPoint.imageUrl,
          secret: this.keyPoint.secret,
          isMandatory: this.keyPoint.encounter?.isMandatory ?? false
        });

        this.preview = this.keyPoint.imageUrl;

        // Encounter (embedded)
        const hasE = !!this.keyPoint.encounter;
        this.keyPointForm.patchValue({ hasEncounter: hasE });

        if (hasE && this.keyPoint.encounter) {
          this.toggleEncounter(true);

          this.encounterGroup.patchValue({
            name: this.keyPoint.encounter.name,
            description: this.keyPoint.encounter.description,
            xp: this.keyPoint.encounter.xp,
            type: this.keyPoint.encounter.type,
            actionDescription: this.keyPoint.encounter.actionDescription || '',
            requiredPeopleCount: this.keyPoint.encounter.requiredPeopleCount || null,
            rangeInMeters: this.keyPoint.encounter.rangeInMeters || null,
            imageUrl: this.keyPoint.encounter.imageUrl || '',
            isMandatory: this.keyPoint.encounter.isMandatory || false
          });

          this.updateValidatorsForType(this.keyPoint.encounter.type);
        } else {
          // No encounter on this key point
          this.toggleEncounter(false);
        }
      } else {
        // Exited edit mode – full reset
        this.keyPointForm.reset();
        this.preview = null;

        // Ensure encounter section is off and disabled
        this.keyPointForm.patchValue({ hasEncounter: false });
        this.toggleEncounter(false);
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

  private toggleEncounter(enabled: boolean): void {
    if (!enabled) {
      this.clearEncounterValidators();
      this.encounterGroup.reset({
        name: '',
        description: '',
        xp: null,
        type: '',
        actionDescription: '',
        requiredPeopleCount: null,
        rangeInMeters: null,
        imageUrl: '',
        isMandatory: false
      });
      this.encounterGroup.disable({ emitEvent: false });
      return;
    }

    this.encounterGroup.enable({ emitEvent: false });

    if (!this.eType?.value) {
      this.eType?.setValue(EncounterType.Misc, { emitEvent: false });
    }

    this.updateValidatorsForType(this.eType?.value as EncounterType);
  }

  private clearEncounterValidators(): void {
    this.eName?.clearValidators();
    this.eDescription?.clearValidators();
    this.eXp?.clearValidators();
    this.eType?.clearValidators();
    this.eActionDescription?.clearValidators();
    this.eRequiredPeopleCount?.clearValidators();
    this.eRangeInMeters?.clearValidators();
    this.eImageUrl?.clearValidators();
  }

  private updateValidatorsForType(type: EncounterType): void {
    // base validators
    this.eName?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(100)]);
    this.eDescription?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(500)]);
    this.eXp?.setValidators([Validators.required, Validators.min(1), Validators.max(10000)]);
    this.eType?.setValidators([Validators.required]);

    // clear type-specific
    this.eActionDescription?.clearValidators();
    this.eRequiredPeopleCount?.clearValidators();
    this.eRangeInMeters?.clearValidators();
    this.eImageUrl?.clearValidators();

    // reset type-specific values
    this.eActionDescription?.setValue('');
    this.eRequiredPeopleCount?.setValue(null);
    this.eRangeInMeters?.setValue(null);
    this.eImageUrl?.setValue('');

    if (type === EncounterType.Misc) {
      this.eActionDescription?.setValidators([Validators.required, Validators.minLength(5)]);
    } else if (type === EncounterType.Social) {
      this.eRequiredPeopleCount?.setValidators([Validators.required, Validators.min(2), Validators.max(100)]);
      this.eRangeInMeters?.setValidators([Validators.required, Validators.min(5), Validators.max(100)]);
      this.eRangeInMeters?.setValue(30);
    } else if (type === EncounterType.HiddenLocation) {
      this.eImageUrl?.setValidators([Validators.required]);
    }

    // update validity
    this.eName?.updateValueAndValidity({ emitEvent: false });
    this.eDescription?.updateValueAndValidity({ emitEvent: false });
    this.eXp?.updateValueAndValidity({ emitEvent: false });
    this.eType?.updateValueAndValidity({ emitEvent: false });
    this.eActionDescription?.updateValueAndValidity({ emitEvent: false });
    this.eRequiredPeopleCount?.updateValueAndValidity({ emitEvent: false });
    this.eRangeInMeters?.updateValueAndValidity({ emitEvent: false });
    this.eImageUrl?.updateValueAndValidity({ emitEvent: false });
  }

}
