import { BadRequestDomainError } from '../../../../shared/domain/errors/bad-request-domain.error';

export class ModelHasVehiclesError extends BadRequestDomainError {
  constructor(id: string) {
    super(`Cannot delete model ${id} because it has associated vehicles`);
  }
}
