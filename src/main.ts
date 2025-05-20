import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AllExceptionsFilter } from "./shared/filter/http-exception.filter";
import ERROR_MESSAGE from "./shared/constants/error";

// https://docs.nestjs.com/techniques/configuration

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các thuộc tính không có trong DTO
      forbidNonWhitelisted: true, // Trả lỗi nếu có query thuộc tính không hợp lệ so với DTO
      transform: true, // Chuyển đổi dữ liệu từ req.body sang plain JSON
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        console.log(errors);
        const formatted = errors.map((err) => ({
          field: err.property,
          errors: Object.values(err.constraints || {}),
          children: err.children || [],
        }));
        return new BadRequestException({
          statusCode: 400,
          message: ERROR_MESSAGE.BAD_REQUEST,
          details: formatted,
        });
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("Office Supply API")
    .setVersion("1.0")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  // Format error response
  app.useGlobalFilters(new AllExceptionsFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<number>("SERVER_PORT", 3000);
  await app.listen(port);
}

bootstrap();
