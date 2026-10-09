import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Greeting } from './greeting.schema';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectModel(Greeting.name) private readonly greetingModel: Model<Greeting>) {}

  // Runs once at startup: insert a greeting if the collection is empty
  async onModuleInit() {
    const count = await this.greetingModel.countDocuments();
    if (count === 0) {
      await this.greetingModel.create({ message: 'Hello from MongoDB!' });
    }
  }

  async getHello(): Promise<{ message: string }> {
    const greeting = await this.greetingModel.findOne().lean();
    return { message: greeting?.message ?? 'No greeting found' };
  }
}
