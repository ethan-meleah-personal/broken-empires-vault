import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

const hex24Regex = /^[0-9a-fA-F]{24}$/;

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {

  transform(value: string): Types.ObjectId {
    const isValid = typeof value === 'string' && hex24Regex.test(value);

    if (!isValid) {
      throw new BadRequestException('Invalid Id Format');
    }

    return new Types.ObjectId(value);
  }
}
