import { AuditMiddleware } from './audit.middleware';
import { MongoService } from '../infrastructure/mongodb/mongo.service';

describe('AuditMiddleware', () => {
  let middleware: AuditMiddleware;
  let mongoService: jest.Mocked<MongoService>;

  beforeEach(() => {
    mongoService = {
      insertLog: jest.fn().mockResolvedValue(undefined),
    } as any;
    middleware = new AuditMiddleware(mongoService);
  });

  it('should call next and register audit log on response finish', () => {
    const req = {
      method: 'POST',
      url: '/vehicles',
      body: { licensePlate: 'ABC-1234', password: 'secretpassword' },
      query: {},
      params: {},
    } as any;

    const res = {
      statusCode: 201,
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          callback();
        }
      }),
    } as any;

    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(mongoService.insertLog).toHaveBeenCalledWith(
      'audit_logs',
      expect.objectContaining({
        endpoint: '/vehicles',
        method: 'POST',
        statusCode: 201,
        payload: expect.objectContaining({
          body: expect.objectContaining({
            licensePlate: 'ABC-1234',
            password: '***REDACTED***',
          }),
        }),
      }),
    );
  });
});
