import { InferSchemaType, Schema } from 'mongoose';

export const valuableSchema = new Schema({});

export type Valuable = InferSchemaType<typeof valuableSchema>;
