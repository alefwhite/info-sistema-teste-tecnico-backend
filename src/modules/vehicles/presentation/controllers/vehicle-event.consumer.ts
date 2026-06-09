import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class VehicleEventConsumer {
  private readonly logger = new Logger(VehicleEventConsumer.name);

  @EventPattern('vehicle.created')
  handleVehicleCreated(@Payload() data: any): void {
    this.logger.log({
      message: 'Consumed vehicle.created event',
      data,
    });
  }

  @EventPattern('vehicle.updated')
  handleVehicleUpdated(@Payload() data: any): void {
    this.logger.log({
      message: 'Consumed vehicle.updated event',
      data,
    });
  }

  @EventPattern('vehicle.deleted')
  handleVehicleDeleted(@Payload() data: any): void {
    this.logger.log({
      message: 'Consumed vehicle.deleted event',
      data,
    });
  }
}
