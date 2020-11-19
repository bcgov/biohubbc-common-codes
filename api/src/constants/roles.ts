// Super user role
const ROLE_SUPER_USER = 'SUP';
// Admin role
const ROLE_ADMIN = 'ADM';
// Data editor role
const ROLE_DATA_EDITOR = 'DAE';
// View only role
const ROLE_DATA_VIEWER = 'DAV';

// Array of all supported roles
export const ALL_ROLES = [ROLE_SUPER_USER, ROLE_ADMIN, ROLE_DATA_EDITOR, ROLE_DATA_VIEWER];

// Array of all roles with read and write capabilities
export const WRITE_ROLES = [ROLE_SUPER_USER, ROLE_ADMIN, ROLE_DATA_EDITOR];
