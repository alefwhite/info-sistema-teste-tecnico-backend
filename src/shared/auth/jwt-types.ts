import { Request } from 'express';
export interface JwtUserPayload {
  sub: string;
  login: string;
  name: string;
  email: string;
}
export interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}
