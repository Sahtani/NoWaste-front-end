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
  styleUrls: ['./announcement-form.component.css']
})
export class AnnouncementFormComponent implements OnInit, OnChanges {
  @Input() editingAnnouncement: Announcement | null = null;
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
    if (changes['editingAnnouncement'] && changes['editingAnnouncement'].currentValue) {
      this.populateFormWithAnnouncement();
    }
  }

  initForm(): void {
    this.announcementForm = this.fb.group({
      title: ['', Validators.required],
      createdAt: [new Date().toISOString().split('T')[0], Validators.required],
      postedDate: [new Date().toISOString(), Validators.required],
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

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview[index] = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFiles[index]);
    }
  }

  populateFormWithAnnouncement(): void {
    // Reset form and recreate product form groups
    this.resetForm();

    // Remove the default empty product
    while (this.productsArray.length > 0) {
      this.productsArray.removeAt(0);
    }

    if (!this.editingAnnouncement) return;

    // Set announcement data
    this.announcementForm.patchValue({
      createdAt: this.formatDateForInput(this.editingAnnouncement.createdAt),
      postedDate: this.editingAnnouncement.postedDate
    });

    // Add product form groups and set values
    this.editingAnnouncement.produits.forEach((product, index) => {
      this.productsArray.push(this.createProductFormGroup());
      this.productsArray.at(index).patchValue({
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        expirationDate: this.formatDateForInput(product.expirationDate),
        location: product.location,
        image: product.image,
        status: product.status
      });

      // Set image preview
      this.imagePreview[index] = product.image;
    });
  }

  resetForm(): void {
    this.initForm();
    this.imagePreview = {};
    this.selectedFiles = {};
  }

  formatDateForInput(date: string): string {
    const d = new Date(date);
    return d.toISOString().substring(0, 10);
  }

  onSubmit(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    // Préparer les données de l'annonce
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
      createdAt: this.announcementForm.get('createdAt')?.value,
      postedDate: this.announcementForm.get('postedDate')?.value,
      produits: products,
      userId: 1
    };
    this.save.emit(announcementData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
