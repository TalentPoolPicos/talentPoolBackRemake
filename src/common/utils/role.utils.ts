// Utility functions for converting between DTO and Prisma role enums
import { Role as DTORole } from '../../auth/enums/role.enum';
import { Role as PrismaRole } from '@prisma/client';

/**
 * Converts DTO Role enum to Prisma Role enum
 */
export function dtoRoleToPrismaRole(dtoRole: DTORole): PrismaRole {
  return dtoRole as unknown as PrismaRole;
}

/**
 * Converts Prisma Role enum to DTO Role enum
 */
export function prismaRoleToDTO(prismaRole: PrismaRole): DTORole {
  return prismaRole as unknown as DTORole;
}

/**
 * Validates if a string is a valid role
 */
export function isValidRole(role: string): role is DTORole {
  return Object.values(DTORole).includes(role as DTORole);
}
