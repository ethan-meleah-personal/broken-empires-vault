import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MODEL_NAMES } from '../common/constants/vault.constants';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(MODEL_NAMES.USER) private userModel: Model<UserDocument>
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    try {
      let allUsers = this.userModel.find().select('-password');
      return allUsers;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
