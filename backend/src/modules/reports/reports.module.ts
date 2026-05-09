import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Course]), AnalyticsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
