/**
 * Interface for Prisma User with includes
 */
export interface UserWithProfiles {
  id: number;
  uuid: string;
  username: string;
  email: string;
  password: string;
  role: string;
  name: string | null;
  description: string | null;
  isVerified: boolean;
  isActive: boolean;
  isComplete: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  student: StudentProfile | null;
  enterprise: EnterpriseProfile | null;
}

/**
 * Interface for Student profile
 */
export interface StudentProfile {
  id: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for Enterprise profile
 */
export interface EnterpriseProfile {
  id: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for Prisma transaction client
 */
export interface PrismaTransaction {
  user: {
    create: (args: any) => Promise<UserWithProfiles>;
    findUnique: (args: any) => Promise<UserWithProfiles | null>;
    findFirst: (args: any) => Promise<UserWithProfiles | null>;
  };
  student: {
    create: (args: any) => Promise<StudentProfile>;
  };
  enterprise: {
    create: (args: any) => Promise<EnterpriseProfile>;
  };
}
