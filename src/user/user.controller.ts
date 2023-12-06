import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { UserService } from './user.service';
import { GetUser } from './get-user.decorator';
import { User, UserDocument } from './schemas/user.schema';
import { EditUserDto } from './dto/edit-user.dto';

@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
    constructor(private userService: UserService) {}

    @Get('me')
    getCurrentUser(@GetUser() user: User) {
        return user;
    }

    @Patch()
    editUser(@GetUser() user: UserDocument, @Body() dto: EditUserDto) {
        return this.userService.editUser(user._id.toString(), dto);
    }
}
