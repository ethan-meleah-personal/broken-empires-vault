import { InferSchemaType, Schema } from 'mongoose';
import { ARMOR_REGIONS, HIT_LOCATION_KEYS } from '../constants/vault.constants';
import { MODEL_NAMES } from '../constants/vault.constants';
import { keyedFields, subdocWithDefault } from '../helpers/vaultHelpers';

const armorPenaltySchema = new Schema(
  {
    affectedSkills: { type: [String], default: [] },
    penaltyValue: { type: Number, default: 0 },
  },
  { _id: false },
);

export const armorSchema = new Schema({
  armorPoints: { type: Number, default: 1, min: 0 },
  hitLocation: { type: String, required: true, enum: HIT_LOCATION_KEYS },
  bulk: { type: Number, default: 0, min: 0 },
  talentPrerequisites: {
    type: [{ type: Schema.Types.ObjectId, ref: MODEL_NAMES.TALENT }],
    default: [],
  },
  sunderable: { type: Boolean, default: false },
  armorPenalties: keyedFields(ARMOR_REGIONS, () => subdocWithDefault(armorPenaltySchema)),
});

export type Armor = InferSchemaType<typeof armorSchema>;
