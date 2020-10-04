import {
  BadRequestException,
  Injectable,
  MethodNotAllowedException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import * as _ from 'lodash';
import * as moment from 'moment';
import bcrypt from 'bcrypt';

import { MailService } from 'src/mail/mail.service';
import { CreateUserTokenDto } from 'src/token/dto/create-user-token.dto';
import { TokenService } from 'src/token/token.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { IReadableUser } from 'src/user/dto/readable-user.interface';
import { roleEnum } from 'src/user/enums/role.enum';
import { statusEnum } from 'src/user/enums/status.enum';
import { IUser } from 'src/user/interfaces/user.interface';
import { UserService } from 'src/user/user.service';
import { SingInDto } from './dto/singin.dto';
import { ITokenPayload } from './interfaces/token-payload.interface';
import { userSensitiveFieldsEnum } from 'src/user/enums/protected-fields.enum';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';

@Injectable()
export class AuthService {
  private readonly clientAppUrl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @InjectSendGrid() private readonly sendGridService: SendGridService,
  ) {}

  async singUp(createUserDto: CreateUserDto): Promise<boolean> {
    const user = await this.userService.create(createUserDto, [roleEnum.user]);

    await this.sendConfirmation(user);
    return true;
  }

  async singIn({ email, password }: SingInDto): Promise<IReadableUser> {
    const user = await this.userService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.status !== statusEnum.active) {
        throw new MethodNotAllowedException();
      }

      const toketPayload = {
        _id: user._id,
        status: user.status,
        roles: user.roles,
      };
      const token = await this.generateToken(toketPayload);
      const expireAt = moment()
        .add(1, 'day')
        .toISOString();

      await this.saveToken({
        token,
        expireAt,
        userId: user._id,
      });

      const readableUser = user.toObject() as IReadableUser;
      readableUser.accessToken = token;

      return _.omit<any>(
        readableUser,
        Object.values(userSensitiveFieldsEnum),
      ) as IReadableUser;
    }
    throw new BadRequestException('Invalid credentials');
  }

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

  async signUser(user: IUser, withStatusCheck = true): Promise<string> {
    if (withStatusCheck && user.status !== statusEnum.active) {
      throw new MethodNotAllowedException();
    }

    const tokenPayload: ITokenPayload = {
      _id: user._id,
      status: user.status,
      roles: user.roles,
    };
    const token = await this.generateToken(tokenPayload);
    const expireAt = moment()
      .add(1, 'day')
      .toISOString();

    await this.saveToken({
      token,
      expireAt,
      userId: user._id,
    });

    return token;
  }

  async sendConfirmation(user: IUser) {
    const token = await this.signUser(user, false);
    const confirmLink = `${this.clientAppUrl}/auth/confirm?token=${token}`;

    const msg = {
      to: user.email, // Change to your recipient
      from: this.configService.get<string>('SERVER_MAIL'), // Change to your verified sender
      subject: 'Sending with SendGrid is Fun',
      html: `
            <h3>Hello ${user.login}!</h3>
             <p>Please use this <a href="${confirmLink}">link</a> to confirm your account.</p>
         `,
    };

    await this.mailService.send(msg);
  }

  private async generateToken(
    data: ITokenPayload,
    options?: SignOptions,
  ): Promise<string> {
    return await this.jwtService.sign(data, options);
  }

  private async verifyToken(token): Promise<any> {
    try {
      const data = this.jwtService.verify(token) as ITokenPayload;
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
