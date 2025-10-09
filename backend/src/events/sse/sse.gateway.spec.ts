import { Test, TestingModule } from '@nestjs/testing';
import { SseGateway } from './sse.gateway';
import { CustomLogger } from 'src/logger/custom-logger.service';
import { Subject } from 'rxjs';
import { SseEvent } from './sse.service';

describe('SseGateway', () => {
  let gateway: SseGateway;
  let loggerMock: Partial<CustomLogger>;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.spyOn(globalThis, 'clearTimeout');
    jest.spyOn(globalThis, 'setTimeout');

    loggerMock = {
      setContext: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SseGateway,
        { provide: CustomLogger, useValue: loggerMock },
      ],
    }).compile();

    gateway = module.get<SseGateway>(SseGateway);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('sets logger context on construction', () => {
    expect(loggerMock.setContext).toHaveBeenCalledWith('SseGateway');
  });

  it('addClient registers a client and returns a stream', () => {
    const stream = gateway.addClient('user1', 'admin');
    expect(stream).toBeInstanceOf(Subject);
    expect(gateway.getClientCount()).toBe(1);
  });

  it('removeClient completes stream, clears timeout, and removes client', () => {
    const stream = gateway.addClient('user2');
    const completeSpy = jest.spyOn(stream, 'complete');
    gateway.removeClient('user2');
    expect(completeSpy).toHaveBeenCalled();
    expect(clearTimeout).toHaveBeenCalled();
    expect(gateway.getClientCount()).toBe(0);
  });

  it('removeClient handles missing timeoutRef without errors', () => {
    gateway.addClient('noTimeout');
    const client = (gateway as any).clients.get('noTimeout');
    client.timeoutRef = undefined;

    expect(() => gateway.removeClient('noTimeout')).not.toThrow();
    expect(gateway.getClientCount()).toBe(0);
  });

  it('emitToAll sends event to all clients', () => {
    const stream1 = gateway.addClient('u1');
    const stream2 = gateway.addClient('u2');
    const next1 = jest.spyOn(stream1, 'next');
    const next2 = jest.spyOn(stream2, 'next');
    const event: SseEvent = { data: 'hello', event: 'msg' };
    gateway.emitToAll(event);
    expect(next1).toHaveBeenCalledWith(event);
    expect(next2).toHaveBeenCalledWith(event);
  });

  it('emitToRole sends only to matching role', () => {
    const streamA = gateway.addClient('a1', 'admin');
    const streamB = gateway.addClient('u1', 'user');
    const nextA = jest.spyOn(streamA, 'next');
    const nextB = jest.spyOn(streamB, 'next');
    const event: SseEvent = { data: 123, event: 'num' };
    gateway.emitToRole('admin', event);
    expect(nextA).toHaveBeenCalledWith(event);
    expect(nextB).not.toHaveBeenCalled();
  });

  it('emitToRole handles no matching clients gracefully', () => {
    gateway.addClient('user1', 'user');
    const event = { data: 'test', event: 'testEvent' };
    expect(() => gateway.emitToRole('admin', event)).not.toThrow();
  });

  it('emitToUser sends to specific client only', () => {
    const stream = gateway.addClient('x1');
    const nextSpy = jest.spyOn(stream, 'next');
    const event: SseEvent = { data: {}, event: 'obj' };
    gateway.emitToUser('x1', event);
    expect(nextSpy).toHaveBeenCalledWith(event);
  });

  it('sendToClient does nothing if client not found', () => {
    const sendToClient = (gateway as any).sendToClient.bind(gateway);
    expect(() => sendToClient('nonexistent', { data: null, event: 'test' })).not.toThrow();
  });

  it('sendToClient resets timeout and updates lastSeen', () => {
    const id = 't1';
    gateway.addClient(id);
    const client = (gateway as any).clients.get(id);
    const oldTimeoutRef = client.timeoutRef;
    const event = { data: 'ping', event: 'heartbeat' };

    (gateway as any).sendToClient(id, event);

    expect(clearTimeout).toHaveBeenCalledWith(oldTimeoutRef);
    expect(setTimeout).toHaveBeenCalled();
    expect(client.lastSeen).toBeGreaterThanOrEqual(Date.now() - 1000);
  });

  it('inactivity timeout removes client and logs warning', () => {
    const id = 'idle1';
    gateway.addClient(id);
    jest.advanceTimersByTime(2 * 60 * 1000 + 1);
    expect(loggerMock.warn).toHaveBeenCalledWith(
      expect.stringContaining(`Client ${id} inactive`),
    );
    expect(gateway.getClientCount()).toBe(0);
  });

  it('getClientCount returns correct count', () => {
    expect(gateway.getClientCount()).toBe(0);
    gateway.addClient('c1');
    gateway.addClient('c2');
    expect(gateway.getClientCount()).toBe(2);
  });

  it('onModuleDestroy cleans up all clients', () => {
    const stream1 = gateway.addClient('d1');
    const stream2 = gateway.addClient('d2');
    const complete1 = jest.spyOn(stream1, 'complete');
    const complete2 = jest.spyOn(stream2, 'complete');
    gateway.onModuleDestroy();
    expect(complete1).toHaveBeenCalled();
    expect(complete2).toHaveBeenCalled();
    expect(gateway.getClientCount()).toBe(0);
  });
});
