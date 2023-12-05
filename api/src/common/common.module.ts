import { Module } from '@nestjs/common';
import { PropertyInputService } from './service/property-input/property-input.service';

@Module({
  providers: [PropertyInputService]
})
export class CommonModule {}
