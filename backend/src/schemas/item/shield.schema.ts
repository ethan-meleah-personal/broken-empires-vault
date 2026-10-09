import { InferSchemaType, Schema } from 'mongoose';

export const shieldSchema = new Schema({
  armorPoints: { type: Number, default: 1, min: 0 },
  shieldBashTarget: { type: Number, default: 0 },
});

export type Shield = InferSchemaType<typeof shieldSchema>;
