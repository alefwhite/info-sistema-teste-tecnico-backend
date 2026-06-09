import { ConflictDomainError } from '../../../../shared/domain/errors/conflict-domain.error';

export class ModelAlreadyExistsError extends ConflictDomainError {
  constructor(name: string, brandId: string) {
    super(`Model with name '${name}' already exists for brand '${brandId}'`);
  }
}
