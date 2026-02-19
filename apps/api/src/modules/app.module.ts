import { Module } from '@nestjs/common';
import { CadencesController } from '../routes/cadences.controller';
import { CadencesService } from '../services/cadences.service';
import { EnrollmentsController } from '../routes/enrollments.controller';
import { EnrollmentsService } from '../services/enrollments.service';

@Module({
  controllers: [CadencesController, EnrollmentsController],
  providers: [CadencesService, EnrollmentsService]
})
export class AppModule {}

