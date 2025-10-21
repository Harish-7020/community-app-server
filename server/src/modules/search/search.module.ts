import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SharedModule } from 'src/shared/modules/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
