import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ITEM_CATEGORIES, MODEL_NAMES } from '../common/constants/vault.constants';
import { armorSchema } from './schemas/armor.schema';
import { consumeableSchema } from './schemas/consumable.schema';
import { itemSchema } from './schemas/item.schema';
import { shieldSchema } from './schemas/shield.schema';
import { threadSchema } from './schemas/thread.schema';
import { valuableSchema } from './schemas/valuable.schema';
import { weaponSchema } from './schemas/weapon.schema';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MODEL_NAMES.ITEM,
        schema: itemSchema,
        discriminators: [
          { name: MODEL_NAMES.WEAPON, schema: weaponSchema, value: ITEM_CATEGORIES.WEAPON },
          { name: MODEL_NAMES.ARMOR, schema: armorSchema, value: ITEM_CATEGORIES.ARMOR },
          { name: MODEL_NAMES.SHIELD, schema: shieldSchema, value: ITEM_CATEGORIES.SHIELD },
          { name: MODEL_NAMES.CONSUMABLE, schema: consumeableSchema, value: ITEM_CATEGORIES.CONSUMABLE },
          { name: MODEL_NAMES.THREAD, schema: threadSchema, value: ITEM_CATEGORIES.THREAD },
          { name: MODEL_NAMES.VALUABLE, schema: valuableSchema, value: ITEM_CATEGORIES.VALUABLE },
        ],
      },
    ]),
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
