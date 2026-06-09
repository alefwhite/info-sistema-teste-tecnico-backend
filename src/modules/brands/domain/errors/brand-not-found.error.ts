import { NotFoundDomainError } from '../../../../shared/domain/errors/not-found-domain.error';

export class BrandNotFoundError extends NotFoundDomainError {
  constructor(id: string) {
    super(`Brand not found with ID: ${id}`);
  }
}
