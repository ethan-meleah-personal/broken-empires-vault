import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MODEL_NAMES } from '../common/constants/vault.constants';
import { talentSchema } from './schemas/talent.schema';
import { TalentsService } from './talents.service';
import { TalentsController } from './talents.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: MODEL_NAMES.TALENT, schema: talentSchema }])],
  controllers: [TalentsController],
  providers: [TalentsService],
  exports: [TalentsService],
})
export class TalentsModule {}
