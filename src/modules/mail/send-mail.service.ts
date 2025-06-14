import { Injectable } from "@nestjs/common";
import { MailService } from "./mail.service";
import { join } from "path";

@Injectable()
export class SendMailService {
  constructor(private readonly mailService: MailService) {}

  async sendTestMail(code: string) {
    await this.mailService.sendMail({
      context: {
        name: "Tạ Đức",
        appName: "Office Supplt",
        code,
      },
      subject: "Bạn có một đơn hàng mới!",
      templatePath: join("src", "modules", "mail", "templates", "welcome.hbs"),
      to: "tacongduc123@gmail.com",
    });

    return;
  }
}
