import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Announcement} from '../../core/models/announcement/announcement.model';
import {Product, ProductStatus} from '../../core/models/product.model';
import {NgForOf, NgIf} from '@angular/common';

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
export class AnnouncementFormComponent implements OnInit, OnChanges {
  @Input() editingAnnouncement: Announcement | null = null ;
  @Input() isSaving = false;
  @Output() save = new EventEmitter<Announcement>();
  @Output() cancel = new EventEmitter<void>();

  announcementForm!: FormGroup;
  imagePreview: {[key: number]: string} = {};
  selectedFiles: {[key: number]: File} = {};

  categories = [
    'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat', 'Fish', 'Frozen', 'Beverages', 'Other'
  ];

  productStatuses = Object.values(ProductStatus);

  constructor(
    private fb: FormBuilder
  ) {
    this.initForm();

  }

  ngOnInit(): void {
    if (this.editingAnnouncement) {
      this.populateFormWithAnnouncement();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges détecté:', changes);

    if (changes['editingAnnouncement']) {
      console.log('Changement de editingAnnouncement:', changes['editingAnnouncement'].currentValue);

      if (changes['editingAnnouncement'].currentValue) {
        setTimeout(() => {
          this.populateFormWithAnnouncement();
        }, 0);
      }
    }
  }

  initForm(): void {
    this.announcementForm = this.fb.group({
      title: ['', Validators.required],
      createdAt: [new Date().toISOString().split('T')[0]],
    //  postedDate: [new Date().toISOString(), Validators.required],
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

  get productsArray(): FormArray {
    return this.announcementForm.get('products') as FormArray;
  }

  addProduct(): void {
    this.productsArray.push(this.createProductFormGroup());
  }

  removeProduct(index: number): void {
    if (this.productsArray.length > 1) {
      this.productsArray.removeAt(index);
      delete this.imagePreview[index];
      delete this.selectedFiles[index];
    } else {
      alert('Une annonce doit contenir au moins un produit');
    }
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles[index] = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview[index] = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFiles[index]);
    }
  }

  populateFormWithAnnouncement(): void {
    console.log('Début de populateFormWithAnnouncement avec:', this.editingAnnouncement);

    this.resetForm();

    while (this.productsArray.length > 0) {
      this.productsArray.removeAt(0);
    }

    if (!this.editingAnnouncement) {
      console.log('Aucune annonce à éditer');
      return;
    }

    console.log('Remplissage du formulaire avec:', this.editingAnnouncement);

    this.announcementForm.get('title')?.setValue(this.editingAnnouncement.title);

    if (this.editingAnnouncement.produits && this.editingAnnouncement.produits.length > 0) {
      this.editingAnnouncement.produits.forEach((product, index) => {
        this.productsArray.push(this.createProductFormGroup());

        const productForm = this.productsArray.at(index) as FormGroup;
        productForm.patchValue({
          id: product.id,
          name: product.name,
          category: product.category,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
          expirationDate: this.formatDateForInput(product.expirationDate),
          location: product.location,
          status: product.status
        });

        if (product.image) {
          this.imagePreview[index] = product.image;
        }
      });
    } else {
      this.productsArray.push(this.createProductFormGroup());
    }
  }

  resetForm(): void {
    this.initForm();
    this.imagePreview = {};
    this.selectedFiles = {};
  }

  formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn('Date invalide:', dateStr);
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', dateStr);
      return '';
    }
  }

  onSubmit(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    const products: Product[] = this.productsArray.controls.map((control, index) => {
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
        image: this.imagePreview[index] || formGroup.get('image')?.value,
        status: formGroup.get('status')?.value,
        announcementId: this.editingAnnouncement?.id
      };
    });

    const announcementData: Announcement = {
      id: this.editingAnnouncement?.id,
      title: this.announcementForm.get('title')?.value,
     // createdAt: this.announcementForm.get('createdAt')?.value,
    //  postedDate: this.announcementForm.get('postedDate')?.value,
      produits: products
    };
    this.save.emit(announcementData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
