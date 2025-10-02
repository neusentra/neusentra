import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
  @ApiProperty({ type: Boolean, example: true })
  success: boolean;

  @ApiProperty({ type: Number, example: 200 })
  statusCode: number;

  @ApiProperty({ type: String, example: 'Operation successful' })
  message: string;

  @ApiProperty({ type: Object, example: { id: 1, name: 'Item 1' } })
  data: any;
}
