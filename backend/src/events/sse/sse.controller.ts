import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Param, Req, Sse } from '@nestjs/common';
import { SseEmitterService } from './sse.service';
import { map, Observable } from 'rxjs';
import { ServerSentEventDto } from './dto/sse.dto';
import { SseGateway } from './sse.gateway';
import { SseEvent } from './interfaces/sse-event.interface';

@ApiTags('Server-Sent Events')
@Controller({ path: 'events', version: '1' })
export class SseController {
  constructor(
    private readonly sseEmitter: SseEmitterService,
    private readonly sseGateway: SseGateway,
  ) {}

  /**
   * 🔄 Global SSE endpoint for server-wide events (e.g. "ping", "notifications")
   */
  @Sse('server')
  @ApiOperation({ summary: 'Subscribe to server-sent events' })
  @ApiResponse({
    status: 200,
    description: 'Continuous stream of server-wide events',
    type: ServerSentEventDto,
    isArray: true,
  })
  events(): Observable<ServerSentEventDto> {
    return this.sseEmitter.eventStream.pipe(
      map(({ event, data }) => ({
        event,
        data,
      })),
    );
  }

  /**
   * 👤 Per-user SSE stream, scoped by user ID
   */
  @Sse('user/:userId')
  @ApiOperation({ summary: 'Subscribe to SSE stream for a user' })
  @ApiResponse({
    status: 200,
    description: 'Continuous SSE stream',
    type: ServerSentEventDto,
  })
  userEvents(
    @Param('userId') userId: string,
    @Req() req: any,
  ): Observable<SseEvent> {
    const role = (req.headers['x-user-role'] as string) ?? 'guest';

    const clientStream = this.sseGateway.addClient(userId, role);

    req.on('close', () => {
      this.sseGateway.removeClient(userId);
    });

    return clientStream.asObservable();
  }
}
