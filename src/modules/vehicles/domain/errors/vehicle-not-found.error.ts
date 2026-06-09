import { NotFoundDomainError } from '../../../../shared/domain/errors/not-found-domain.error';

export class VehicleNotFoundError extends NotFoundDomainError {
  constructor(id: string) {
    super(`Vehicle not found with ID: ${id}`);
  }
}
