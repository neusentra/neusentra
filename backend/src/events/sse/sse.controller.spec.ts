import { Test, TestingModule } from '@nestjs/testing';
import { SseController } from './sse.controller';
import { SseEmitterService, SseEvent } from './sse.service';
import { SseGateway } from './sse.gateway';
import { of, Subject } from 'rxjs';

describe('SseController', () => {
  let controller: SseController;
  let emitterServiceMock: Partial<SseEmitterService>;
  let sseGatewayMock: Partial<SseGateway>;

  beforeEach(async () => {
    emitterServiceMock = {
      eventStream: of({ event: 'testEvent', data: { foo: 'bar' } }),
    };

    sseGatewayMock = {
      addClient: jest.fn(),
      removeClient: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SseController],
      providers: [
        { provide: SseEmitterService, useValue: emitterServiceMock },
        { provide: SseGateway, useValue: sseGatewayMock },
      ],
    }).compile();

    controller = module.get<SseController>(SseController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('events', () => {
    it('should return mapped event stream from sseEmitter', (done) => {
      const result$ = controller.events();

      result$.subscribe(value => {
        expect(value).toEqual({ event: 'testEvent', data: { foo: 'bar' } });
        done();
      });
    });
  });

  describe('userEvents', () => {
    it('should add client with role from header and setup close handler', () => {
      const userId = 'user123';
      const role = 'admin';
      const mockStream = new Subject<SseEvent>();
      const asObservableSpy = jest.spyOn(mockStream, 'asObservable');

      (sseGatewayMock.addClient as jest.Mock).mockReturnValue(mockStream);

      const mockReq = {
        headers: { 'x-user-role': role },
        on: jest.fn(),
      };

      const result$ = controller.userEvents(userId, mockReq as any);

      expect(sseGatewayMock.addClient).toHaveBeenCalledWith(userId, role);
      expect(mockReq.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(asObservableSpy).toHaveBeenCalled();
      expect(result$).toBeDefined();
    });

    it('should default role to guest if no x-user-role header', () => {
      const userId = 'user456';
      const mockStream = new Subject<SseEvent>();
      (sseGatewayMock.addClient as jest.Mock).mockReturnValue(mockStream);

      const mockReq = {
        headers: {},
        on: jest.fn(),
      };

      controller.userEvents(userId, mockReq as any);
      expect(sseGatewayMock.addClient).toHaveBeenCalledWith(userId, 'guest');
    });

    it('should handle x-user-role header with undefined value', () => {
      const userId = 'user789';
      const mockStream = new Subject<SseEvent>();
      (sseGatewayMock.addClient as jest.Mock).mockReturnValue(mockStream);

      const mockReq = {
        headers: { 'x-user-role': undefined },
        on: jest.fn(),
      };

      controller.userEvents(userId, mockReq as any);
      expect(sseGatewayMock.addClient).toHaveBeenCalledWith(userId, 'guest');
    });

    it('should remove client when request closes', () => {
      const userId = 'user999';
      const mockStream = new Subject<SseEvent>();
      (sseGatewayMock.addClient as jest.Mock).mockReturnValue(mockStream);

      const mockReq = {
        headers: { 'x-user-role': 'user' },
        on: jest.fn(),
      };

      controller.userEvents(userId, mockReq as any);

      // Simulate the close event
      const closeHandler = mockReq.on.mock.calls.find(call => call[0] === 'close')[1];
      closeHandler();

      expect(sseGatewayMock.removeClient).toHaveBeenCalledWith(userId);
    });
  });
});
