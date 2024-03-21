import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

@Module({
  exports: [UsersService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      throw new Error('ADMIN username or password not provided');
    }

    const admin = await this.usersService.getByUsername(ADMIN_USERNAME);
    if (!admin) {
      await this.usersService.createAdmin(ADMIN_USERNAME, ADMIN_PASSWORD);
    }
  }
}
