import { SetMetadata } from '@nestjs/common';
import { PUBLIC_METADATA } from 'src/common/constants';

export const Public = () => SetMetadata(PUBLIC_METADATA, true);
