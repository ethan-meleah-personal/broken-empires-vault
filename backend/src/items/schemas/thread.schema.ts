import { InferSchemaType, Schema } from 'mongoose';

export const threadSchema = new Schema({});

export type threadSchema = InferSchemaType<typeof threadSchema>;
