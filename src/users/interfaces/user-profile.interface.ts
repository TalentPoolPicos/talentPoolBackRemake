import type {
  User,
  Student,
  Enterprise,
  SocialMedia,
  Tag,
  Address,
  Attachment,
} from '@prisma/client';

/**
 * Interface para usuário completo com todas as relações
 */
export interface UserWithFullProfile extends User {
  student?:
    | (Student & {
        curriculum?: Attachment | null;
      })
    | null;
  enterprise?: Enterprise | null;
  socialMedia?: SocialMedia[];
  tags?: Tag[];
  address?: Address | null;
  avatar?: Attachment | null;
  banner?: Attachment | null;
}

/**
 * Interface para perfil público do usuário (sem dados sensíveis)
 */
export interface PublicUserProfile {
  uuid: string;
  username: string;
  name: string | null;
  description: string | null;
  birthDate: Date | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  student?: Student | null;
  enterprise?: Enterprise | null;
  socialMedia?: SocialMedia[];
  tags?: Tag[];
  address?: Address | null;
  avatar?: Attachment | null;
  banner?: Attachment | null;
}

/**
 * Interface para perfil privado do usuário (com dados sensíveis)
 */
export interface PrivateUserProfile extends PublicUserProfile {
  email: string;
  isComplete: boolean;
}

/**
 * Interface para estatísticas do usuário
 */
export interface UserStats {
  totalLikesReceived: number;
  totalLikesGiven: number;
  profileCompleteness: number;
  joinedDate: Date;
  lastActiveDate: Date;
}
