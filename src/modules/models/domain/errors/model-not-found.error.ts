import { NotFoundDomainError } from '../../../../shared/domain/errors/not-found-domain.error';

export class ModelNotFoundError extends NotFoundDomainError {
  constructor(id: string) {
    super(`Model not found with ID: ${id}`);
  }
}
