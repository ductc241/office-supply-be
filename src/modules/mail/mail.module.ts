import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MailService } from "./mail.service";
import { SendMailService } from "./send-mail.service";

@Module({
  imports: [ConfigModule],
  providers: [MailService, SendMailService],
  exports: [MailService, SendMailService],
})
export class MailModule {}
