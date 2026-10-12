import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MODEL_NAMES } from '../common/constants/vault.constants';
import { characterSchema } from './schemas/character.schema';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: MODEL_NAMES.CHARACTER, schema: characterSchema }])],
  controllers: [CharactersController],
  providers: [CharactersService],
  exports: [CharactersService],
})
export class CharactersModule {}
