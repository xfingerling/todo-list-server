import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import * as moment from 'moment';
import { MailService } from 'src/mail/mail.service';
import { CreateUserTokenDto } from 'src/token/dto/create-user-token.dto';
import { TokenService } from 'src/token/token.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { roleEnum } from 'src/user/enums/role.enum';
import { statusEnum } from 'src/user/enums/status.enum';
import { IUser } from 'src/user/interfaces/user.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  private readonly clientAppUrl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async singUp(createUserDto: CreateUserDto): Promise<boolean> {
    const user = await this.userService.create(createUserDto, [roleEnum.user]);
    await this.sendConfirmation(user);
    return true;
  }

  // async singIn(email, password) {}

  async confirm(token: string): Promise<IUser> {
    const data = await this.verifyToken(token);
    const user = await this.userService.find(data._id);

    await this.tokenService.delete(user._id, token);

    if (user && user.status === statusEnum.pending) {
      user.status = statusEnum.active;
      return user.save();
    }
    throw new BadRequestException('Confirmation error');
  }

  async sendConfirmation(user: IUser) {
    const expiresIn = 60 * 60 * 24; // 24 hours
    const tokenPayload = {
      _id: user._id,
      status: user.status,
      role: user.roles,
    };
    const expireAt = moment()
      .add(1, 'day')
      .toISOString();

    const token = await this.generateToken(tokenPayload, { expiresIn });
    const confirmLink = `${this.clientAppUrl}/auth/confirm?token=${token}`;

    await this.saveToken({ token, userId: user._id, expireAt });
    await this.mailService.send({
      from: this.configService.get<string>('SERVER_MAIL'),
      to: user.email,
      subject: 'Verify User',
      text: `
      <h3>Hello ${user.login}!<h3>
      <p>Please use this <a href="${confirmLink}">link</a> to confirm your account</p>
      `,
    });
  }

  private async generateToken(data, options?: SignOptions): Promise<string> {
    return await this.jwtService.sign(data, options);
  }

  private async verifyToken(token): Promise<any> {
    try {
      const data = this.jwtService.verify(token);
      const tokenExists = await this.tokenService.exists(data._id, token);

      if (tokenExists) {
        return data;
      }

      throw new UnauthorizedException();
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private async saveToken(createUserTokenDto: CreateUserTokenDto) {
    const userToken = await this.tokenService.create(createUserTokenDto);

    return userToken;
  }
}
