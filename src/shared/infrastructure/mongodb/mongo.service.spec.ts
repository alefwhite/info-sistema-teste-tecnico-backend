import { MongoService } from './mongo.service';
import { ConfigService } from '@nestjs/config';

describe('MongoService', () => {
  let service: MongoService;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'mongo.uri') {
          return 'mongodb://localhost:27017/test_db';
        }
        return null;
      }),
    } as any;
    service = new MongoService(mockConfigService);
  });

  it('should construct correctly and set config', () => {
    expect(service).toBeDefined();
    expect(service.getIsConnected()).toBe(false);
  });

  it('should gracefully handle connection failures without throwing exception', async () => {
    await expect(service.onModuleInit()).resolves.not.toThrow();
    expect(service.getIsConnected()).toBe(false);
  });
});
