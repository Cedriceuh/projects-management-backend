import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { JwtDecodeMiddleware } from './middleware/jwt-decode.middleware';

const mongoURI = process.env.MONGO_URI || '';

@Module({
  imports: [
    MongooseModule.forRoot(mongoURI),
    AuthModule,
    ProjectsModule,
    UsersModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtDecodeMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
