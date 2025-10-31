import { Test, TestingModule } from '@nestjs/testing';
import { HttpClientService } from './http-client.service';
import { HttpService } from '@nestjs/axios';
import { CustomLogger } from 'src/logger/custom-logger.service';
import { of, throwError } from 'rxjs';

describe('HttpClientService', () => {
  let service: HttpClientService;
  let httpService: jest.Mocked<HttpService>;
  let logger: jest.Mocked<CustomLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpClientService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CustomLogger,
          useValue: {
            setContext: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HttpClientService>(HttpClientService);
    httpService = module.get(HttpService);
    logger = module.get(CustomLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('GET', () => {
    it('should return data on success', async () => {
      const mockData = { message: 'success' };
      httpService.get.mockReturnValue(of({ data: mockData }));

      const result = await service.get('http://test-url');
      expect(result).toEqual(mockData);
      expect(httpService.get).toHaveBeenCalledWith(
        'http://test-url',
        undefined,
      );
    });

    it('should log and throw on error', async () => {
      const error = new Error('Failed');
      httpService.get.mockReturnValue(throwError(() => error));

      await expect(service.get('http://test-url')).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });

  describe('POST', () => {
    it('should return data on success', async () => {
      const mockData = { success: true };
      httpService.post.mockReturnValue(of({ data: mockData }));

      const result = await service.post('http://test-url', { name: 'test' });
      expect(result).toEqual(mockData);
      expect(httpService.post).toHaveBeenCalledWith(
        'http://test-url',
        { name: 'test' },
        undefined,
      );
    });

    it('should log and throw on error', async () => {
      const error = new Error('Post Error');
      httpService.post.mockReturnValue(throwError(() => error));

      await expect(service.post('url', {})).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });

  describe('PUT', () => {
    it('should return data on success', async () => {
      const mockData = { updated: true };
      httpService.put.mockReturnValue(of({ data: mockData }));

      const result = await service.put('url', { id: 1 });
      expect(result).toEqual(mockData);
    });

    it('should log and throw on error', async () => {
      const error = new Error('Put Error');
      httpService.put.mockReturnValue(throwError(() => error));

      await expect(service.put('url', {})).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });

  describe('PATCH', () => {
    it('should return data on success', async () => {
      const mockData = { patched: true };
      httpService.patch.mockReturnValue(of({ data: mockData }));

      const result = await service.patch('url', { id: 1 });
      expect(result).toEqual(mockData);
    });

    it('should log and throw on error', async () => {
      const error = new Error('Patch Error');
      httpService.patch.mockReturnValue(throwError(() => error));

      await expect(service.patch('url', {})).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });

  describe('DELETE', () => {
    it('should return data on success', async () => {
      const mockData = { deleted: true };
      httpService.delete.mockReturnValue(of({ data: mockData }));

      const result = await service.delete('url');
      expect(result).toEqual(mockData);
    });

    it('should log and throw on error', async () => {
      const error = new Error('Delete Error');
      httpService.delete.mockReturnValue(throwError(() => error));

      await expect(service.delete('url')).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });
});
