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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStatus', () => {
    it('should return a success response', () => {
      const result = controller.getStatus();

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    // Optional: add stricter checks if SuccessResponseDto has a known shape
    it('should return a valid SuccessResponseDto structure', () => {
      const response = controller.getStatus();

      // If SuccessResponseDto has 'message' or 'data' fields, for example:
      expect(response).toHaveProperty('message'); // Example field
      expect(typeof response.message).toBe('string');
    });
  });
});