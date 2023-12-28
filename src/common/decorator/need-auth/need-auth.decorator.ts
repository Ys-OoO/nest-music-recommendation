import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/user/entities/user.entity';

export const NEED_AUTH_KEY = 'needAuth';
export const NeedAuth = (role: UserRole = UserRole.VISITOR) =>
  SetMetadata(NEED_AUTH_KEY, role);
