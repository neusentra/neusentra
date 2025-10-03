import { interval, Observable, Subject } from 'rxjs';
import { Injectable, OnModuleDestroy, Scope } from '@nestjs/common';
import { CustomLogger } from 'src/logger/custom-logger.service';
import { SseGateway } from './sse.gateway';
import { SseEventType } from 'src/common/enums/sse-event.enum';

export interface SseEvent<T = unknown> {
  event: string;
  data: T;
}

@Injectable()
export class SseEmitterService implements OnModuleDestroy {
  private readonly eventSubject = new Subject<SseEvent>();

  constructor(
    private readonly sseGateway: SseGateway,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(SseEmitterService.name);

    // Automatic ping to all clients every 30s
    interval(30_000).subscribe(() => {
      this.emitToAll('ping', { timestamp: new Date().toISOString() });
    });
  }

  /**
   * Global event stream used by controller's `/events/server`
   */
  get eventStream(): Observable<SseEvent> {
    return this.eventSubject.asObservable();
  }

  /**
   * Emits a server-sent event to all connected clients.
   *
   * @param event - The event name (e.g., 'system.updated')
   * @param data - Serializable data to send
   */
  emitToAll<T = unknown>(event: SseEventType | string, data: T): void {
    this.logger.debug(`Emitting to all users: ${event}`);
    this.sseGateway.emitToAll({ event, data });
  }

  /**
   * Emits a server-sent event to all clients of a specific role.
   *
   * @param role - The target role (e.g., 'admin', 'auditor')
   * @param event - The event name
   * @param data - Payload
   */
  emitToRole<T = unknown>(role: string, event: string, data: T) {
    this.logger.debug(`Emitting to role ${role}: ${event}`);
    this.sseGateway.emitToRole(role, { event, data });
  }

  /**
   * Emits an event to a specific user.
   *
   * @param userId - The unique user ID
   * @param event - The event name
   * @param data - Payload
   */
  emitToUser(userId: string, event: string, data: any) {
    this.sseGateway.emitToUser(userId, { event, data });
  }

  /**
   * Clean up the internal stream on shutdown.
   */
  onModuleDestroy() {
    this.logger.log('Cleaning up SSE stream');
    this.eventSubject.complete();
  }
}
