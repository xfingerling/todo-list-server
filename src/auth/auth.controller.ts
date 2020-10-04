import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { IReadableUser } from 'src/user/dto/readable-user.interface';
import { AuthService } from './auth.service';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { SingInDto } from './dto/singin.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signUp')
  async signUp(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<boolean> {
    return this.authService.singUp(createUserDto);
  }

  @Get('/confirm')
  async confirm(@Query(new ValidationPipe()) query: ConfirmAccountDto) {
    await this.authService.confirm(query.token);
    return true;
  }

  @Post('/singIn')
  async singIn(
    @Body(new ValidationPipe()) singInDto: SingInDto,
  ): Promise<IReadableUser> {
    return await this.authService.singIn(singInDto);
  }
}
