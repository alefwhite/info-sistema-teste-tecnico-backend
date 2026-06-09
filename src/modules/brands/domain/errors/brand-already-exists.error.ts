import { ConflictDomainError } from '../../../../shared/domain/errors/conflict-domain.error';

export class BrandAlreadyExistsError extends ConflictDomainError {
  constructor(name: string) {
    super(`Brand name already exists: ${name}`);
  }
}
