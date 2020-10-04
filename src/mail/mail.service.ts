import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMailGunData } from './interfaces/mail.interface';

import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    @InjectSendGrid() private readonly sendGridService: SendGridService,
  ) {}

  send(data: IMailGunData) {
    this.sendGridService
      .send(data)
      .then(() => {
        console.log('Email sent');
      })
      .catch(error => {
        console.error(error);
      });
  }
}
