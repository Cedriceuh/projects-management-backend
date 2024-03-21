import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

const mongoURI = process.env.MONGO_URI || '';

@Module({
  imports: [MongooseModule.forRoot(mongoURI), AuthModule, UsersModule],
})
export class AppModule {}
