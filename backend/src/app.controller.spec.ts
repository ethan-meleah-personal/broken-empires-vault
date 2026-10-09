import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Greeting } from './greeting.schema';

describe('AppController', () => {
  let appController: AppController;
  const greetingModel = {
    countDocuments: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: getModelToken(Greeting.name), useValue: greetingModel }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('returns the stored greeting', async () => {
      greetingModel.findOne.mockReturnValue({
        lean: () => Promise.resolve({ message: 'Hello from MongoDB!' }),
      });

      await expect(appController.getHello()).resolves.toEqual({
        message: 'Hello from MongoDB!',
      });
    });

    it('falls back when no greeting exists', async () => {
      greetingModel.findOne.mockReturnValue({
        lean: () => Promise.resolve(null),
      });

      await expect(appController.getHello()).resolves.toEqual({
        message: 'No greeting found',
      });
    });
  });
});
