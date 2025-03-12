
export enum Roles {
  DONOR = 'DONOR',
  BENEFICIARY = 'BENEFICIARY',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  GUEST = 'GUEST'
}

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: Roles[];
  createdAt?: Date;
}
