import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as handlebars from "handlebars";
import { ConfigService } from "@nestjs/config";
import { readFileSync } from "fs";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("MAIL_HOST"),
      port: this.configService.get<number>("MAIL_PORT"),
      auth: {
        user: this.configService.get<string>("MAIL_USER"),
        pass: this.configService.get<string>("MAIL_PASS"),
      },
    });
  }

  async sendMail({
    templatePath,
    context,
    ...mailOptions
  }: nodemailer.SendMailOptions & {
    templatePath: string;
    context: Record<string, unknown>;
  }): Promise<void> {
    let html: string | undefined;
    if (templatePath) {
      const template = await readFileSync(templatePath, "utf-8");
      html = handlebars.compile(template, { strict: true })(context);
    }

    await this.transporter.sendMail({
      ...mailOptions,
      from: `${this.configService.get<string>("MAIL_DEFAULT_NAME")} <${this.configService.get<string>("MAIL_DEFAULT_EMAIL")}>`,
      html: mailOptions.html ? mailOptions.html : html,
    });
  }
}
