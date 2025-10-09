import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('Health')
@Controller('status')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get health of the server' })
  @ApiResponse({ type: SuccessResponseDto, status: HttpStatus.OK })
  getStatus(this: void): SuccessResponseDto {
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Server is healthy',
      data: {},
    };
  }
}
