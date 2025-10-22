// analytics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { constructResponse } from '../../shared/utils/helpers';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@Query() dto: AnalyticsQueryDto) {
    const result = await this.analyticsService.getOverview(dto);
    return constructResponse(true, result, 200);
  }

  @Get('users')
  async getUserMetrics(@Query() dto: AnalyticsQueryDto) {
    const result = await this.analyticsService.getUserMetrics(dto);
    return constructResponse(true, result, 200);
  }

  @Get('communities')
  async getCommunityMetrics(@Query() dto: AnalyticsQueryDto) {
    const result = await this.analyticsService.getCommunityMetrics(dto);
    return constructResponse(true, result, 200);
  }

  @Get('posts')
  async getPostMetrics(@Query() dto: AnalyticsQueryDto) {
    const result = await this.analyticsService.getPostMetrics(dto);
    return constructResponse(true, result, 200);
  }

  @Get('engagement')
  async getEngagementMetrics(@Query() dto: AnalyticsQueryDto) {
    const result = await this.analyticsService.getEngagementMetrics(dto);
    return constructResponse(true, result, 200);
  }

  @Get('trends')
  async getTrendsMetrics(@Query() dto: AnalyticsQueryDto) {
    const result = await this.analyticsService.getTrendsMetrics(dto);
    return constructResponse(true, result, 200);
  }
}
