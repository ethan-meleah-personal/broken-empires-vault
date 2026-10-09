import { HydratedDocument, InferSchemaType, Schema } from 'mongoose';
import { MODEL_NAMES } from '../constants/vault.constants';

export const userSchema = new Schema(
  {
    email: { type: String, trim: true, lowercase: true, required: true, unique: true },
    username: { type: String, trim: true, lowercase: true, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    characters: { type: [{ type: Schema.Types.ObjectId, ref: MODEL_NAMES.CHARACTER }], default: [] },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;
