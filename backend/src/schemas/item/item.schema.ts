import { HydratedDocument, InferSchemaType, Schema } from 'mongoose';
import { ITEMS_COLLECTION } from '../constants/vault.constants';
import { supplyDieField } from '../helpers/vaultHelpers';

export const ITEM_DISCRIMINATOR_KEY = 'category';

const itemSkillBonusSchema = new Schema(
  {
    skillName: { type: String, required: true },
    bonusValue: { type: Number, required: true },
  },
  { _id: false },
);

export const itemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    itemType: { type: String, required: true },
    description: { type: String },
    encumbrance: { type: Number, default: 0, min: 0 },
    value: { type: Number, default: 0, min: 0 },
    itemSkillBonus: { type: [itemSkillBonusSchema], default: [] },
    itemUsageDice: supplyDieField(),
    itemUses: { type: Number, default: 0, min: 0 },
  },
  {
    discriminatorKey: ITEM_DISCRIMINATOR_KEY,
    collection: ITEMS_COLLECTION,
    timestamps: true,
  },
);

export type Item = InferSchemaType<typeof itemSchema>;
export type ItemDocument = HydratedDocument<Item>;
