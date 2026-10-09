import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { Greeting } from './../src/greeting.schema';

// The Mongoose model is stubbed so this runs without a database.
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const greetingModel = {
      countDocuments: jest.fn().mockResolvedValue(1),
      create: jest.fn(),
      findOne: jest.fn().mockReturnValue({
        lean: () => Promise.resolve({ message: 'Hello from MongoDB!' }),
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: getModelToken(Greeting.name), useValue: greetingModel },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api/hello (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/hello')
      .expect(200)
      .expect({ message: 'Hello from MongoDB!' });
  });

  afterEach(async () => {
    await app.close();
  });
});
