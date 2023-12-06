import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JWT_EXPIRES_IN_NAME, JWT_SECRET_NAME } from './jwt.constants';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
    private readonly jwtSecret: string;
    private readonly jwtExpiresIn: string;

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private userService: UserService,
    ) {
        this.jwtSecret = this.configService.getOrThrow(JWT_SECRET_NAME);
        this.jwtExpiresIn = this.configService.getOrThrow(JWT_EXPIRES_IN_NAME);
    }

    async register(dto: RegisterDto) {
        try {
            const createUserDto = new CreateUserDto();
            createUserDto.name = dto.name;
            createUserDto.email = dto.email;
            createUserDto.passwordHash = await argon.hash(dto.password);

            const user = await this.userService.createUser(createUserDto);
            return this.signToken(user._id.toString());
        } catch (err) {
            if (err && err.code === 11000) {
                throw new ForbiddenException('Email already exists');
            }

            throw err;
        }
    }

    async login(dto: LoginDto) {
        const user = await this.userService.findOneByEmail(dto.email);

        if (user) {
            const passwordMatch = await argon.verify(user.passwordHash, dto.password);

            if (passwordMatch) {
                return this.signToken(user._id.toString());
            }
        }

        throw new ForbiddenException('Credentials are incorrect');
    }

    async signToken(sub: string): Promise<{ access_token: string }> {
        const access_token = await this.jwtService.signAsync(
            { sub },
            {
                expiresIn: this.jwtExpiresIn,
                secret: this.jwtSecret,
            },
        );

        return { access_token };
    }
}
