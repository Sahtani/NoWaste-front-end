import {Roles} from './user/user.model';

export interface AuthenticationResponse {
  name: string;
  email: string;
  role: Roles[];
  token: string;



}
