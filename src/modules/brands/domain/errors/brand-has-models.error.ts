import { BadRequestDomainError } from '../../../../shared/domain/errors/bad-request-domain.error';

export class BrandHasModelsError extends BadRequestDomainError {
  constructor(id: string) {
    super(`Cannot delete brand ${id} because it has associated models`);
  }
}
