import {Roles, User} from '../models/user/user.model';


export function determineUserRoles(user: User | null) {
  if (!user) {
    return {
      isDonor: false,
      isBeneficiary: false,
      isAdmin: false
    };
  }

  const role = user.role || '';

  return {
    isDonor:
      role === Roles.DONOR ||
      role === 'ROLE_' + Roles.DONOR ||
      (Array.isArray(role) && (role.includes(Roles.DONOR) || role.includes('ROLE_' + Roles.DONOR))),

    isBeneficiary:
      role === Roles.BENEFICIARY ||
      role === 'ROLE_' + Roles.BENEFICIARY ||
      (Array.isArray(role) && (role.includes(Roles.BENEFICIARY) || role.includes('ROLE_' + Roles.BENEFICIARY))),

    isAdmin:
      role === Roles.ADMIN ||
      role === 'ROLE_' + Roles.ADMIN ||
      (Array.isArray(role) && (role.includes(Roles.ADMIN) || role.includes('ROLE_' + Roles.ADMIN)))
  };
}
