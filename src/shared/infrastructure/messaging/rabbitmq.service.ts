import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitmqService {
  private readonly logger = new Logger(RabbitmqService.name);

  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  async publishVehicleCreated(vehicleId: string, licensePlate: string, createdBy: string): Promise<void> {
    const payload = {
      vehicleId,
      licensePlate,
      createdBy,
      timestamp: new Date().toISOString(),
    };
    await this.emitSafe('vehicle.created', payload);
  }

  async publishVehicleUpdated(vehicleId: string, licensePlate: string, updatedBy: string): Promise<void> {
    const payload = {
      vehicleId,
      licensePlate,
      createdBy: updatedBy,
      timestamp: new Date().toISOString(),
    };
    await this.emitSafe('vehicle.updated', payload);
  }

  async publishVehicleDeleted(vehicleId: string, licensePlate: string, deletedBy: string): Promise<void> {
    const payload = {
      vehicleId,
      licensePlate,
      createdBy: deletedBy,
      timestamp: new Date().toISOString(),
    };
    await this.emitSafe('vehicle.deleted', payload);
  }

  private async emitSafe(pattern: string, payload: any): Promise<void> {
    try {
      this.logger.log({
        message: `Publishing event to RabbitMQ`,
        pattern,
        payload,
      });
      // Emite o evento assincronamente e captura erros sem bloquear o fluxo principal
      this.client.emit(pattern, payload).subscribe({
        error: (err) => {
          this.logger.error(`Failed to emit event ${pattern} to RabbitMQ`, err);
        },
      });
    } catch (error) {
      this.logger.error(`Exception during publishing of event ${pattern}`, error);
    }
  }
}
