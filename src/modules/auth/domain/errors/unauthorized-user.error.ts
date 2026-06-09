import { UnauthorizedDomainError } from '../../../../shared/domain/errors/unauthorized-domain.error';

export class UnauthorizedUserError extends UnauthorizedDomainError {
  constructor() {
    super('Invalid credentials');
  }
}
