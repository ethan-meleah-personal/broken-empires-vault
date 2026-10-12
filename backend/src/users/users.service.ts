import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MODEL_NAMES } from '../common/constants/vault.constants';

const SALT_ROUNDS = 10;
const DUPLICATE_KEY_ERROR = 11000;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(MODEL_NAMES.USER) private userModel: Model<User>
  ) {}

  private hashPassword(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  private handleError(error: unknown, action: string): never {
    if ((error as { code?: number })?.code === DUPLICATE_KEY_ERROR) {
      throw new ConflictException('Email or username already in use');
    }
    this.logger.error(`Failed to ${action}`, error instanceof Error ? error.stack : String(error));
    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      const passwordHash = await this.hashPassword(createUserDto.password);

      const newUser = await this.userModel.create({
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash,
      });
      this.logger.log(`User created: ${newUser.id}`);

      return {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      };
    } catch (error) {
      this.handleError(error, 'create user');
    }
  }

  async findAllUsers() {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      this.handleError(error, 'find users');
    }
  }

  async findOneUser(id: Types.ObjectId) {
    let user: UserDocument | null;
    try {
      user = await this.userModel.findById(id).exec();
    } catch (error) {
      this.handleError(error, 'find user');
    }
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmailForAuth(email: string) {
    try {
      return await this.userModel
        .findOne({ email: email.toLowerCase() })
        .select('+passwordHash')
        .exec();
    } catch (error) {
      this.handleError(error, 'find user');
    }
  }

  // NOTE FOR LATER - MAKE SURE THAT ONLY USERS WHO ACTUALLY *ARE* THE USERS CAN PATCH USERS
  async updateUser(id: Types.ObjectId, updateUserDto: UpdateUserDto) {
    const changes: Partial<Pick<User, 'email' | 'username' | 'passwordHash'>> = {};
    if (updateUserDto.email !== undefined) changes.email = updateUserDto.email;
    if (updateUserDto.username !== undefined) changes.username = updateUserDto.username;

    let user: UserDocument | null;
    try {
      if (updateUserDto.password !== undefined) {
        changes.passwordHash = await this.hashPassword(updateUserDto.password);
      }
      user = await this.userModel
        .findByIdAndUpdate(id, { $set: changes }, { new: true, runValidators: true })
        .exec();
    } catch (error) {
      this.handleError(error, 'update user');
    }
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // NOTE FOR LATER - MAKE SURE THAT ONLY USERS WHO ACTUALLY *ARE* THE USERS CAN DELETE USERS
  async removeUser(id: Types.ObjectId) {
    let deletedCount: number;
    try {
      ({ deletedCount } = await this.userModel.deleteOne({ _id: id }).exec());
    } catch (error) {
      this.handleError(error, 'delete user');
    }
    if (deletedCount === 0) throw new NotFoundException('User not found');
    return { deleted: true };
  }
}
