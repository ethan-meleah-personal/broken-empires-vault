import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Greeting as GreetingShape } from './shared/greeting';

@Schema()
export class Greeting implements GreetingShape {
  @Prop({ required: true })
  message: string;
}

export const GreetingSchema = SchemaFactory.createForClass(Greeting);
