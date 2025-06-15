import { Injectable } from "@nestjs/common";
import { MailService } from "./mail.service";
import { join } from "path";
import { InvetoryItem } from "./type/mail.type";

@Injectable()
export class SendMailService {
  constructor(private readonly mailService: MailService) {}

  async senNewOrderMail(code: string) {
    await this.mailService.sendMail({
      to: "tacongduc123@gmail.com",
      subject: "Bạn có một đơn hàng mới!",
      templatePath: join(
        "src",
        "modules",
        "mail",
        "templates",
        "new-order.hbs",
      ),
      context: {
        name: "Tạ Đức",
        appName: "Office Supplt",
        code,
      },
    });

    return;
  }

  async sendInventoryReport(inventoryList: InvetoryItem[]) {
    await this.mailService.sendMail({
      to: "tacongduc123@gmail.com",
      subject: "Cảnh báo số lượng tồn kho thấp",
      templatePath: join(
        "src",
        "modules",
        "mail",
        "templates",
        "inventory-report.hbs",
      ),
      template: "./inventory-report",
      context: {
        inventories: inventoryList,
        createdAt: new Date().toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
        }),
      },
    });
  }
}
