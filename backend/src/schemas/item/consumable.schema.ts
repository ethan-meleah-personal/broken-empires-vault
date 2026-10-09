import { InferSchemaType, Schema } from 'mongoose';

export const consumeableSchema = new Schema({});

export type consumeableSchema = InferSchemaType<typeof consumeableSchema>;
