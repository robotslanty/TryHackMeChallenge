import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.getOrThrow('PORT');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.listen(port);
    console.log(`Listening on port ${port}`);
}
bootstrap();
