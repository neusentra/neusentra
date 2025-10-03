import { CustomLogger } from 'src/logger/custom-logger.service';
import { SseGateway } from './sse.gateway';
import { SseEvent } from './sse.service';
import { TestingModule } from '@nestjs/testing';

describe('SseGateway', () => {
  let gateway: SseGateway;
  let logger: CustomLogger;

  beforeEach(() => {
    logger = {
      setContext: jest.fn(),
      warn: jest.fn(),
    } as any;
    gateway = new SseGateway(logger);
  });

  it('should add and remove clients properly', () => {
    const stream = gateway.addClient('user1', 'admin');
    expect(gateway.getClientCount()).toBe(1);

    gateway.removeClient('user1');
    expect(gateway.getClientCount()).toBe(0);
  });

  it('should emit events to a user', (done) => {
    const stream = gateway.addClient('user1');
    stream.subscribe((event) => {
      expect(event.event).toBe('test-event');
      expect(event.data).toEqual({ foo: 'bar' });
      done();
    });

    gateway.emitToUser('user1', { event: 'test-event', data: { foo: 'bar' } });
  });

  it('should emit events to role', (done) => {
    const adminStream = gateway.addClient('user1', 'admin');
    const userStream = gateway.addClient('user2', 'user');

    let adminReceived = false;
    let userReceived = false;

    adminStream.subscribe((event) => {
      expect(event.event).toBe('role-event');
      adminReceived = true;
      if (adminReceived && userReceived) done();
    });

    userStream.subscribe(() => {
      userReceived = true;
      done.fail('User role should not receive event');
    });

    gateway.emitToRole('admin', { event: 'role-event', data: null });

    // Allow some time to process
    setTimeout(() => {
      if (!adminReceived) done.fail('Admin did not receive event');
      done();
    }, 10);
  });

  it('should emit events to all clients', (done) => {
    gateway.addClient('user1');
    gateway.addClient('user2');
    it('should emit events to all clients', (done) => {
      const s1 = gateway.addClient('user1');
      const s2 = gateway.addClient('user2');

      let count = 0;
      [s1, s2].forEach((stream) => {
        stream.subscribe((event) => {
          expect(event.event).toBe('broadcast');
          count++;
          if (count === 2) done();
        });
      });

      gateway.emitToAll({ event: 'broadcast', data: null });
    });
    const TIMEOUT = 2 * 60 * 1000;

    gateway.addClient('user1');

    expect(gateway.getClientCount()).toBe(1);

    jest.advanceTimersByTime(TIMEOUT + 1000);

    expect(gateway.getClientCount()).toBe(0);
    jest.useRealTimers();
  });
});
