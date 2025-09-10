import type { User, Student, Enterprise } from '@prisma/client';

// Common types and enums exported from Prisma
export { Role } from '@prisma/client';

// Type utilities for user relations
export type UserWithRelations = User & {
  student?: Student | null;
  enterprise?: Enterprise | null;
};
