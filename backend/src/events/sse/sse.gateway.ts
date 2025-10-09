import { Subject } from 'rxjs';
import { SseEvent } from './sse.service';
import { Injectable } from '@nestjs/common';
import { CustomLogger } from 'src/logger/custom-logger.service';

interface Client<T = any> {
  id: string;
  role?: string;
  stream: Subject<SseEvent>;
  lastSeen: number;
  timeoutRef?: NodeJS.Timeout;
}

@Injectable()
export class SseGateway {
  private readonly clients: Map<string, Client> = new Map();

  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext(SseGateway.name);
  }

  /**
   * Adds a new SSE client and starts a timeout watcher.
   *
   * @param id - Unique client/user ID
   * @param role - Optional role
   * @returns Subject<SseEvent> for pushing messages
   */
  addClient<T = any>(id: string, role?: string): Subject<SseEvent<T>> {
    const stream = new Subject<SseEvent<T>>();
    const now = Date.now();
    const timeoutRef = this.startInactivityTimeout(id);
    const client: Client<T> = {
      id,
      role,
      stream,
      lastSeen: now,
      timeoutRef,
    };

    this.clients.set(id, client);
    return stream;
  }

  /**
   * Removes a client from memory and closes stream.
   *
   * @param id - Client ID
   */
  removeClient(id: string): void {
    const client = this.clients.get(id);
    if (client) {
      client.stream.complete();
      clearTimeout(client.timeoutRef);
      this.clients.delete(id);
    }
  }

  /**
   * Sends an event to all clients.
   *
   * @param event - SseEvent<T>
   */
  emitToAll<T = any>(event: SseEvent<T>): void {
    for (const client of this.clients.values()) {
      this.sendToClient(client.id, event);
    }
  }

  /**
   * Sends an event to all clients with a specific role.
   *
   * @param role - e.g., 'admin'
   * @param event - SseEvent<T>
   */
  emitToRole<T = any>(role: string, event: SseEvent<T>): void {
    for (const client of this.clients.values()) {
      if (client.role === role) {
        this.sendToClient(client.id, event);
      }
    }
  }

  /**
   * Sends an event to a specific client by ID.
   *
   * @param id - User/client ID
   * @param event - SseEvent<T>
   */
  emitToUser<T = any>(id: string, event: SseEvent<T>): void {
    this.sendToClient(id, event);
  }

  /**
   * Core function to send and reset timeout.
   */
  private sendToClient<T = any>(id: string, event: SseEvent<T>): void {
    const client = this.clients.get(id);
    if (!client) return;

    client.lastSeen = Date.now();
    client.stream.next(event);

    // Reset inactivity timeout
    clearTimeout(client.timeoutRef);
    client.timeoutRef = this.startInactivityTimeout(id);
  }

  /**
   * Starts a timer that removes the client after inactivity.
   *
   * @param id - Client ID
   * @returns NodeJS.Timeout
   */
  private startInactivityTimeout(id: string): NodeJS.Timeout {
    const TIMEOUT_DURATION = 2 * 60 * 1000; // 2 minutes

    return setTimeout(() => {
      this.logger.warn(
        `Client ${id} inactive for ${TIMEOUT_DURATION / 1000}s. Removing...`,
      );
      this.removeClient(id);
    }, TIMEOUT_DURATION);
  }

  /**
   * Get current active connection count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Clean up on shutdown
   */
  onModuleDestroy(): void {
    for (const id of this.clients.keys()) {
      this.removeClient(id);
    }
  }
}
