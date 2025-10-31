import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto<T = object> {
  @ApiProperty({ type: Boolean, example: true })
  success: boolean;

  @ApiProperty({ type: Number, example: 200 })
  statusCode: number;

  @ApiProperty({ type: String, example: 'Operation successful' })
  message: string;

  @ApiProperty({ type: Object })
  data: T;
}
