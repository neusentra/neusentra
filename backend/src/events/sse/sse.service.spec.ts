import { SseEmitterService } from './sse.service';
import { CustomLogger } from 'src/logger/custom-logger.service';
import { SseGateway } from './sse.gateway';

describe('SseEmitterService', () => {
  let service: SseEmitterService;
  let gateway: SseGateway;
  let logger: CustomLogger;

  beforeEach(() => {
    gateway = {
      emitToAll: jest.fn(),
      emitToRole: jest.fn(),
      emitToUser: jest.fn(),
    } as any;

    logger = {
      setContext: jest.fn(),
      debug: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    } as any;

    jest.useFakeTimers();

    service = new SseEmitterService(gateway, logger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call emitToAll with "ping" every 30 seconds', () => {
    jest.advanceTimersByTime(30_000);
    expect(gateway.emitToAll).toHaveBeenCalledWith({
      event: 'ping',
      data: expect.objectContaining({ timestamp: expect.any(String) }),
    });
  });

  it('should emit to all users', () => {
    service.emitToAll('custom-event', { foo: 'bar' });
    expect(logger.debug).toHaveBeenCalledWith(
      'Emitting to all users: custom-event',
    );
    expect(gateway.emitToAll).toHaveBeenCalledWith({
      event: 'custom-event',
      data: { foo: 'bar' },
    });
  });

  it('should emit to role', () => {
    service.emitToRole('admin', 'admin-event', { baz: 123 });
    expect(logger.debug).toHaveBeenCalledWith(
      'Emitting to role admin: admin-event',
    );
    expect(gateway.emitToRole).toHaveBeenCalledWith('admin', {
      event: 'admin-event',
      data: { baz: 123 },
    });
  });

  it('should emit to user', () => {
    service.emitToUser('user1', 'user-event', { val: 42 });
    expect(gateway.emitToUser).toHaveBeenCalledWith('user1', {
      event: 'user-event',
      data: { val: 42 },
    });
  });

  it('should complete eventSubject on destroy', () => {
    const completeSpy = jest.spyOn(service['eventSubject'], 'complete');
    service.onModuleDestroy();
    expect(logger.log).toHaveBeenCalledWith('Cleaning up SSE stream');
    expect(completeSpy).toHaveBeenCalled();
  });
});
