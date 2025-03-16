export interface AnnouncementDetails {
  // Propriétés de base de l'annonce
  id: string;
  userId: string;         // ID de l'utilisateur/vendeur
  userName?: string;      // Nom du vendeur/créateur de l'annonce
  userAvatar?: string;    // URL de l'avatar du vendeur
  userRating?: number;    // Note du vendeur (optionnel)
  postedDate: Date;       // Date de publication

  // Informations sur les produits
  produits: ProductDetails[];

  // Informations supplémentaires
  interestedUsers?: InterestedUser[];  // Utilisateurs intéressés
  similarItems?: ProductDetails[];     // Articles similaires
  contactInfo?: ContactInfo;           // Informations de contact (optionnel)
}

export interface ProductDetails {
  id: string;
  name: string;
  description?: string;
  price?: number;
  quantity: number;
  location?: string;
  status: 'AVAILABLE' | 'RESERVED' | 'UNAVAILABLE' | 'EXPIRED';
  image?: string;         // URL de l'image
  expiryDate?: Date;      // Date d'expiration
  category?: string;      // Catégorie du produit
  tags?: string[];        // Tags/étiquettes associés
}

export interface InterestedUser {
  id: string;
  name: string;
  avatar?: string;
  contactInfo?: ContactInfo;
  dateInterested?: Date;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  preferredMethod?: 'email' | 'phone' | 'app';
}
