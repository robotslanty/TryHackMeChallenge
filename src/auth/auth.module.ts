import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
    imports: [ConfigModule, JwtModule.register({}), UserModule],
    controllers: [AuthController],
    providers: [JwtStrategy, AuthService],
})
export class AuthModule {}
