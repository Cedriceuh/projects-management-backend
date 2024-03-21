import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

const APPLICATION_SECRET = process.env.APPLICATION_SECRET || '';

@Module({
  controllers: [AuthController],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: APPLICATION_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  exports: [AuthService],
  providers: [AuthService],
})
export class AuthModule {}
