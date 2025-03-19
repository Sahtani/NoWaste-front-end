import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product, ProductStatus } from '../../core/models/product.model';
import { NgForOf, NgIf } from '@angular/common';
import {AuthService} from '../../core/services/authentication/auth.service';
import {forkJoin, Observable, tap} from 'rxjs';
import {User} from '../../core/models/user/user.model';
import {AnnouncementRequest} from '../../core/models/announcement-request.model';
import {AnnouncementService} from '../../core/services/announcement/announcement.service';

@Component({
  selector: 'app-announcement-form',
  templateUrl: './announcement-form.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf
  ],
  standalone: true,
  styleUrls: ['./announcement-form.component.css']
})
export class AnnouncementFormComponent implements OnChanges {
  @Input() editingAnnouncement: AnnouncementRequest | null = null;
  @Input() isSaving = false;
  @Output() save = new EventEmitter<AnnouncementRequest>();
  @Output() cancel = new EventEmitter<void>();

  announcementForm!: FormGroup;
  imagePreview: { [key: number]: string } = {};
  selectedFiles: { [key: number]: File } = {};
  uploadErrors: { [key: number]: string } = {};
  categories = [
    'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat', 'Fish', 'Frozen', 'Beverages', 'Other'
  ];

  productStatuses = Object.values(ProductStatus);

  constructor(private fb: FormBuilder, private authService: AuthService, private announcementService: AnnouncementService) {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingAnnouncement'] && changes['editingAnnouncement'].currentValue) {
      this.manuallyPopulateForm();
    }
  }

  ngOnDestroy(): void {
    Object.values(this.imagePreview).forEach(url => {
      if (url && typeof url === 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }

  initForm(): void {
    this.announcementForm = this.fb.group({
      title: ['', Validators.required],
      products: this.fb.array([this.createProductFormGroup()])
    });
  }

  createProductFormGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      expirationDate: [new Date().toISOString().split('T')[0], Validators.required],
      location: ['', Validators.required],
      image: [''],
      status: [ProductStatus.AVAILABLE]
    });
  }

  manuallyPopulateForm(): void {
    this.resetForm();

    if (!this.editingAnnouncement) {
      return;
    }

    this.announcementForm.get('title')?.setValue(this.editingAnnouncement.title);

    while (this.productsArray.length > 0) {
      this.productsArray.removeAt(0);
    }

    const products = this.editingAnnouncement.products || [];

    if (products.length === 0) {
      this.productsArray.push(this.createProductFormGroup());
      return;
    }

    products.forEach((product, index) => {
      const productGroup = this.fb.group({
        id: [product.id],
        name: [product.name, Validators.required],
        category: [product.category, Validators.required],
        description: [product.description, Validators.required],
        price: [product.price, [Validators.required, Validators.min(0)]],
        quantity: [product.quantity, [Validators.required, Validators.min(1)]],
        expirationDate: [this.formatDateForInput(product.expirationDate), Validators.required],
        location: [product.location, Validators.required],
        image: [product.image || ''],
        status: [product.status || ProductStatus.AVAILABLE]
      });

      this.productsArray.push(productGroup);

      if (product.image) {
        this.imagePreview[index] = product.image;
      }
    });
  }

  get productsArray(): FormArray {
    return this.announcementForm.get('products') as FormArray;
  }

  addProduct(): void {
    this.productsArray.push(this.createProductFormGroup());
  }

  removeProduct(index: number): void {
    if (this.productsArray.length > 1) {
      this.productsArray.removeAt(index);

      if (this.imagePreview[index] && this.imagePreview[index].startsWith('blob:')) {
        URL.revokeObjectURL(this.imagePreview[index]);
      }

      delete this.imagePreview[index];
      delete this.selectedFiles[index];
      delete this.uploadErrors[index];

      const newImagePreview: { [key: number]: string } = {};
      const newSelectedFiles: { [key: number]: File } = {};
      const newUploadErrors: { [key: number]: string } = {};

      Object.keys(this.imagePreview).forEach(key => {
        const i = parseInt(key);
        if (i > index) {
          newImagePreview[i-1] = this.imagePreview[i];
          delete this.imagePreview[i];
        } else if (i < index) {
          newImagePreview[i] = this.imagePreview[i];
        }
      });

      Object.keys(this.selectedFiles).forEach(key => {
        const i = parseInt(key);
        if (i > index) {
          newSelectedFiles[i-1] = this.selectedFiles[i];
          delete this.selectedFiles[i];
        } else if (i < index) {
          newSelectedFiles[i] = this.selectedFiles[i];
        }
      });

      Object.keys(this.uploadErrors).forEach(key => {
        const i = parseInt(key);
        if (i > index) {
          newUploadErrors[i-1] = this.uploadErrors[i];
          delete this.uploadErrors[i];
        } else if (i < index) {
          newUploadErrors[i] = this.uploadErrors[i];
        }
      });

      this.imagePreview = newImagePreview;
      this.selectedFiles = newSelectedFiles;
      this.uploadErrors = newUploadErrors;
    } else {
      alert('Une annonce doit contenir au moins un produit');
    }
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.uploadErrors[index] = 'Le fichier sélectionné n\'est pas une image';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.uploadErrors[index] = 'L\'image ne doit pas dépasser 5MB';
        return;
      }

      delete this.uploadErrors[index];

      if (this.imagePreview[index] && this.imagePreview[index].startsWith('blob:')) {
        URL.revokeObjectURL(this.imagePreview[index]);
      }

      this.selectedFiles[index] = file;
      this.imagePreview[index] = URL.createObjectURL(file);
    }
  }

  resetForm(): void {
    Object.values(this.imagePreview).forEach(url => {
      if (url && typeof url === 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url as string);
      }
    });

    this.announcementForm = this.fb.group({
      title: ['', Validators.required],
      products: this.fb.array([this.createProductFormGroup()])
    });

    this.imagePreview = {};
    this.selectedFiles = {};
    this.uploadErrors = {};
  }

  formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';

    try {
      if (dateStr.includes('T')) {
        return dateStr.split('T')[0];
      }

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return '';
      }

      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  }

  onSubmit(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    const currentUserId = this.authService.getCurrentUser()?.id;
    console.log(currentUserId,'user id mkynch ');
    if (!currentUserId) {
      return;
    }

    if (Object.keys(this.uploadErrors).length > 0) {
      alert('Veuillez corriger les erreurs d\'image avant de soumettre');
      return;
    }

    const imageUploads: Observable<any>[] = [];

    Object.keys(this.selectedFiles).forEach(index => {
      const i = parseInt(index);
      const file = this.selectedFiles[i];
      if (file) {
        const upload = this.announcementService.uploadProductImage(file).pipe(
          tap((imageUrl: string) => {
            const control = this.productsArray.at(i) as FormGroup;
            control.get('image')?.setValue(imageUrl);
          })
        );
        imageUploads.push(upload);
      }
    });

    if (imageUploads.length > 0) {
      forkJoin(imageUploads).subscribe({
        next: () => this.submitAnnouncementRequestData(currentUserId),
        error: (error) => {
          console.error('Erreur lors de l\'upload des images:', error);
          alert('Une erreur est survenue lors du téléchargement des images. Veuillez réessayer.');
        }
      });
    } else {
      this.submitAnnouncementRequestData(currentUserId);
    }
  }

  private submitAnnouncementRequestData(userId: number): void {
    const products: Product[] = this.productsArray.controls.map((control) => {
      const formGroup = control as FormGroup;
      return {
        id: formGroup.get('id')?.value,
        name: formGroup.get('name')?.value,
        category: formGroup.get('category')?.value,
        description: formGroup.get('description')?.value,
        price: formGroup.get('price')?.value,
        quantity: formGroup.get('quantity')?.value,
        expirationDate: formGroup.get('expirationDate')?.value,
        location: formGroup.get('location')?.value,
        image: formGroup.get('image')?.value,
        status: formGroup.get('status')?.value,
        announcementId: this.editingAnnouncement?.id
      };
    });


    const announcementData: AnnouncementRequest = {
      id: this.editingAnnouncement?.id,
      title: this.announcementForm.get('title')?.value,
      createdAt: this.editingAnnouncement?.createdAt || new Date(),
      products: products,
      userId: this.authService.getCurrentUser()?.id,
    };

    this.save.emit(announcementData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
