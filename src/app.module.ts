import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { PaginationModule } from './pagination/pagination.module';
import { FilteringModule } from './filtering/filtering.module';
import { SurveyModule } from './survey/survey.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    CategoryModule,
    PaginationModule,
    FilteringModule,
    SurveyModule,
    AnalyticsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
