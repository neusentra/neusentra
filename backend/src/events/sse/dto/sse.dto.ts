import { ApiProperty } from '@nestjs/swagger';

export class ServerSentEventDto {
  @ApiProperty({ example: 'ping', description: 'The SSE event name' })
  event: string;

  @ApiProperty({
    example: { message: 'Hello from server' },
    description: 'Payload data for the event',
    type: Object,
  })
  data: unknown;
}
