import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatus', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should return success response with correct structure', () => {
      const result = controller.getStatus();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
    });

    it('should return success true', () => {
      const result = controller.getStatus();
      expect(result.success).toBe(true);
    });

    it('should return HTTP 200 status code', () => {
      const result = controller.getStatus();
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.statusCode).toBe(200);
    });

    it('should return correct health message', () => {
      const result = controller.getStatus();
      expect(result.message).toBe('Server is healthy');
    });

    it('should return empty data object', () => {
      const result = controller.getStatus();
      expect(result.data).toEqual({});
      expect(typeof result.data).toBe('object');
    });

    it('should return SuccessResponseDto type', () => {
      const result = controller.getStatus();
      const expectedResponse: SuccessResponseDto = {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Server is healthy',
        data: {},
      };

      expect(result).toEqual(expectedResponse);
    });

    it('should be synchronous and not return a promise', () => {
      const result = controller.getStatus();
      expect(result).not.toBeInstanceOf(Promise);
    });

    it('should have consistent return values on multiple calls', () => {
      const result1 = controller.getStatus();
      const result2 = controller.getStatus();
      const result3 = controller.getStatus();

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
      expect(result1).toEqual(result3);
    });

    it('should return response matching the expected JSON structure', () => {
      const result = controller.getStatus();
      const jsonString = JSON.stringify(result);
      const parsedResult = JSON.parse(jsonString) as SuccessResponseDto;

      expect(parsedResult).toEqual({
        success: true,
        statusCode: 200,
        message: 'Server is healthy',
        data: {},
      });
    });

    it('should have all required properties with correct types', () => {
      const result = controller.getStatus();

      expect(typeof result.success).toBe('boolean');
      expect(typeof result.statusCode).toBe('number');
      expect(typeof result.message).toBe('string');
      expect(typeof result.data).toBe('object');
    });
  });

  describe('controller metadata', () => {
    it('should have correct controller path', () => {
      const controllerMetadata = Reflect.getMetadata(
        'path',
        HealthController,
      ) as string;
      expect(controllerMetadata).toBe('status');
    });

    it('should have GET method defined', () => {
      const prototype = HealthController.prototype;
      const method = prototype.getStatus;
      expect(typeof method).toBe('function');
      expect(method).toBeDefined();
    });
  });
});
