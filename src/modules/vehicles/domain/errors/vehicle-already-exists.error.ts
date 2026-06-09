import { ConflictDomainError } from '../../../../shared/domain/errors/conflict-domain.error';

export class VehicleAlreadyExistsError extends ConflictDomainError {
  constructor(field: string, value: string) {
    super(`Vehicle with ${field} '${value}' already exists`);
  }
}
