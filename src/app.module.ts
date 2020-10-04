import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SendGridModule } from '@ntegral/nestjs-sendgrid';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { configModule } from './configure.root';
import { TokenModule } from './token/token.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    configModule,

    MongooseModule.forRoot(process.env.MONGODB_WRITE_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }),

    SendGridModule.forRoot({
      apiKey: process.env.SENDGRID_API_KEY,
    }),

    TokenModule,
    MailModule,
  ],
})
export class AppModule {}
