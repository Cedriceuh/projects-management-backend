import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';

@Global()
@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
  ],
  exports: [AuthModule, UsersModule, MongooseModule],
})
export class TestSetupModule {}
