import { Subject, of } from 'rxjs';
import { SseGateway } from './sse.gateway';
import { SseController } from './sse.controller';
import { SseEmitterService } from './sse.service';

describe('SseController', () => {
  let controller: SseController;
  let sseEmitter: Partial<SseEmitterService>;
  let sseGateway: SseGateway;

  beforeEach(() => {
    sseEmitter = {
      eventStream: new Subject(),
    } as any;

    sseGateway = {
      addClient: jest.fn(),
      removeClient: jest.fn(),
    } as any;

    controller = new SseController(sseEmitter as SseEmitterService, sseGateway);
  });

  it('should return the global event stream', (done) => {
    const event = { event: 'ping', data: { timestamp: 'now' } };
    (sseEmitter as any).eventStream = of(event);

    controller.events().subscribe((e) => {
      expect(e).toEqual(event);
      done();
    });
  });

  it('should add and remove user client', () => {
    const fakeStream = new Subject();
    const req = {
      headers: { 'x-user-role': 'admin' },
      on: jest.fn((event, cb) => {
        if (event === 'close') {
          cb();
        }
      }),
    };

    (sseGateway.addClient as jest.Mock).mockReturnValue(fakeStream);

    const stream$ = controller.userEvents('user1', req as any);
    expect(sseGateway.addClient).toHaveBeenCalledWith('user1', 'admin');
    expect(req.on).toHaveBeenCalledWith('close', expect.any(Function));
    expect(sseGateway.removeClient).toHaveBeenCalledWith('user1');

    // Stream should be the same as returned by addClient
    expect(stream$).toBe(fakeStream.asObservable());
  });
});
