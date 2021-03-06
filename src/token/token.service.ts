import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserTokenDto } from './dto/create-user-token.dto';
import { IUserToken } from './interfaces/user-token.interface';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel('Token') private readonly tokenModel: Model<IUserToken>,
  ) {}

  async create(createUserTokenDto: CreateUserTokenDto): Promise<IUserToken> {
    const userToken = new this.tokenModel(createUserTokenDto);
    return await userToken.save();
  }

  async delete(
    userId: string,
    token: string,
  ): Promise<{ ok?: number; n?: number }> {
    return await this.tokenModel.deleteOne({ userId, token });
  }

  async deleteAll(userId: string): Promise<{ ok?: number; n?: number }> {
    return await this.tokenModel.deleteMany({ userId });
  }

  async exists(userId: string, token: string): Promise<boolean> {
    return this.tokenModel.exists({ userId, token });
  }
}
