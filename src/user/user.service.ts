import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, isValidObjectId } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectConnection() private mongoConnection: Connection,
    ) {}

    getConnection() {
        return this.mongoConnection;
    }

    findOneByEmail(email: string) {
        return this.userModel.findOne({ email });
    }

    findOneById(id: string) {
        return this.userModel.findById(id);
    }

    async createUser(dto: CreateUserDto) {
        await this.checkExistingUserEmail(dto.email);

        const user = new this.userModel({
            name: dto.name,
            email: dto.email,
            passwordHash: dto.passwordHash,
        });

        return user.save();
    }

    async editUser(id: string, dto: EditUserDto) {
        if (!isValidObjectId(id)) {
            throw new ForbiddenException('Invalid id');
        }

        await this.checkExistingUserEmail(dto.email);

        let user = await this.findOneById(id);

        if (!user) {
            throw new ForbiddenException('User does not exist');
        }

        user = Object.assign(user, dto);
        return user.save();
    }

    async checkExistingUserEmail(email: string) {
        const existingUser = await this.findOneByEmail(email);

        if (existingUser) {
            throw new ForbiddenException('User already exists');
        }
    }
}
