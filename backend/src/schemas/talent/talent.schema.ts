import { HydratedDocument, InferSchemaType, Schema } from 'mongoose';
import { MODEL_NAMES } from '../constants/vault.constants';
import { skillBonusSchema } from '../shared/skillBonus.schema';

export const talentSchema = new Schema({
  name: { type: String, required: true, trim: true, unique: true },
  prerequisites: { type: [{ type: Schema.Types.ObjectId, ref: MODEL_NAMES.TALENT }], default: [] },
  description: { type: String, required: true },
  skillBonus: { type: [skillBonusSchema], default: [] },
});

export type Talent = InferSchemaType<typeof talentSchema>;
export type TalentDocument = HydratedDocument<Talent>;
