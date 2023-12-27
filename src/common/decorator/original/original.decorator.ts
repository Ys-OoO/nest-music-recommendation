import { SetMetadata } from '@nestjs/common';

export const RETURN_ORIGINAL_KEY = 'original';
export const Original = () => SetMetadata(RETURN_ORIGINAL_KEY, true);
