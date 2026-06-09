import { RabbitmqService } from './rabbitmq.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('RabbitmqService', () => {
  let service: RabbitmqService;
  let mockClientProxy: jest.Mocked<ClientProxy>;

  beforeEach(() => {
    mockClientProxy = {
      emit: jest.fn().mockReturnValue(of({})),
    } as any;
    service = new RabbitmqService(mockClientProxy);
  });

  it('should call emit on ClientProxy for vehicle.created', async () => {
    await service.publishVehicleCreated('1', 'ABC-1234', 'user-1');
    expect(mockClientProxy.emit).toHaveBeenCalledWith(
      'vehicle.created',
      expect.objectContaining({
        vehicleId: '1',
        licensePlate: 'ABC-1234',
        createdBy: 'user-1',
      }),
    );
  });

  it('should call emit on ClientProxy for vehicle.updated', async () => {
    await service.publishVehicleUpdated('1', 'ABC-1234', 'user-1');
    expect(mockClientProxy.emit).toHaveBeenCalledWith(
      'vehicle.updated',
      expect.objectContaining({
        vehicleId: '1',
        licensePlate: 'ABC-1234',
        createdBy: 'user-1',
      }),
    );
  });

  it('should call emit on ClientProxy for vehicle.deleted', async () => {
    await service.publishVehicleDeleted('1', 'ABC-1234', 'user-1');
    expect(mockClientProxy.emit).toHaveBeenCalledWith(
      'vehicle.deleted',
      expect.objectContaining({
        vehicleId: '1',
        licensePlate: 'ABC-1234',
        createdBy: 'user-1',
      }),
    );
  });
});
