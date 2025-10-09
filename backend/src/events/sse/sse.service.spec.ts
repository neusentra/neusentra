import { Test, TestingModule } from '@nestjs/testing';
import { SseEmitterService } from './sse.service';
import { SseGateway } from './sse.gateway';
import { CustomLogger } from 'src/logger/custom-logger.service';

jest.useFakeTimers();

describe('SseEmitterService', () => {
  let service: SseEmitterService;
  let sseGatewayMock: Partial<SseGateway>;
  let loggerMock: Partial<CustomLogger>;

  beforeEach(async () => {
    sseGatewayMock = {
      emitToAll: jest.fn(),
      emitToRole: jest.fn(),
      emitToUser: jest.fn(),
    };

    loggerMock = {
      setContext: jest.fn(),
      debug: jest.fn(),
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SseEmitterService,
        { provide: SseGateway, useValue: sseGatewayMock },
        { provide: CustomLogger, useValue: loggerMock },
      ],
    }).compile();

    service = module.get<SseEmitterService>(SseEmitterService);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('should set logger context on construction', () => {
    expect(loggerMock.setContext).toHaveBeenCalledWith('SseEmitterService');
  });

  it('should emit ping event every 30 seconds', () => {
    // Initially no emit calls
    expect(sseGatewayMock.emitToAll).not.toHaveBeenCalled();

    // Fast-forward time by 30s interval once
    jest.advanceTimersByTime(30_000);

    expect(sseGatewayMock.emitToAll).toHaveBeenCalledWith({
      event: 'ping',
      data: expect.objectContaining({ timestamp: expect.any(String) }),
    });

    // Fast-forward another 30s
    jest.advanceTimersByTime(30_000);

    expect(sseGatewayMock.emitToAll).toHaveBeenCalledTimes(2);
  });

  it('eventStream returns observable from eventSubject', () => {
    const stream = service.eventStream;
    expect(stream.subscribe).toBeInstanceOf(Function);
  });

  it('emitToAll logs and emits to all clients', () => {
    service.emitToAll('testEvent', { foo: 'bar' });
    expect(loggerMock.debug).toHaveBeenCalledWith('Emitting to all users: testEvent');
    expect(sseGatewayMock.emitToAll).toHaveBeenCalledWith({
      event: 'testEvent',
      data: { foo: 'bar' },
    });
  });

  it('emitToRole logs and emits to role clients', () => {
    service.emitToRole('admin', 'roleEvent', { a: 1 });
    expect(loggerMock.debug).toHaveBeenCalledWith('Emitting to role admin: roleEvent');
    expect(sseGatewayMock.emitToRole).toHaveBeenCalledWith('admin', {
      event: 'roleEvent',
      data: { a: 1 },
    });
  });

  it('emitToUser emits event to specific user', () => {
    service.emitToUser('user1', 'userEvent', { x: 42 });
    expect(sseGatewayMock.emitToUser).toHaveBeenCalledWith('user1', {
      event: 'userEvent',
      data: { x: 42 },
    });
  });

  it('onModuleDestroy completes the eventSubject and logs', () => {
    const completeSpy = jest.spyOn(service['eventSubject'], 'complete');
    service.onModuleDestroy();
    expect(completeSpy).toHaveBeenCalled();
    expect(loggerMock.log).toHaveBeenCalledWith('Cleaning up SSE stream');
  });
});
