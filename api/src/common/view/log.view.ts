import { ApiProperty } from '@nestjs/swagger';
import { CommonLogEntity } from '../model/common/common-log.entity';
import { BaseEntity } from 'typeorm';

export class LogView {

  constructor(list: Array<CommonLogEntity<BaseEntity>>) {
    for (const item of list) {
      this.version = item.version;

      this.items.push({
        value: item.value,
        from: item.from,
        to: item.to,
      });
    }
  }

  @ApiProperty()
  version: number;

  items: Array<{
    value: string,
    from: string,
    to: string,
  }> = [];

}