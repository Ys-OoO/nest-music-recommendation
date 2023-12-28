import { SetMetadata } from '@nestjs/common';

export const IS_PRIVATE_KEY = 'isPublic';
export const Private = () => SetMetadata(IS_PRIVATE_KEY, true);
