import { InferSchemaType, Schema } from 'mongoose';

export const skillBonusSchema = new Schema(
  {
    skillName: { type: String, required: true },
    bonusValue: { type: Number, required: true },
  },
  { _id: false },
);

export type SkillBonus = InferSchemaType<typeof skillBonusSchema>;
