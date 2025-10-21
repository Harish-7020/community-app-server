import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { constructResponse } from '../../shared/utils/helpers';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query() dto: SearchQueryDto) {
    const result = await this.searchService.search(dto);
    return constructResponse(true, result, 200);
  }
}
