import jwt, { SignOptions } from 'jsonwebtoken';
import { Request } from 'express';
import { AuthUser, GraphQLContext } from '../types/context';
import { AuthenticationError, ForbiddenError } from '../utils/errors';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JwtPayload {
  id: string;
  email: string;
  role: 'HR' | 'CANDIDATE';
  iat: number;
  exp: number;
}

export const generateToken = (user: { id: string; email: string; role: 'HR' | 'CANDIDATE' }): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] };
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    options
  );
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
};

export const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
};

export const getUserFromToken = async (token: string | null): Promise<AuthUser | null> => {
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user || user.isDeleted) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
};

export const requireAuth = (context: GraphQLContext): AuthUser => {
  if (!context.user) {
    throw new AuthenticationError('You must be logged in');
  }
  return context.user;
};

export const requireRole = (context: GraphQLContext, ...roles: ('HR' | 'CANDIDATE')[]): AuthUser => {
  const user = requireAuth(context);

  if (!roles.includes(user.role)) {
    throw new ForbiddenError(`This action requires one of these roles: ${roles.join(', ')}`);
  }

  return user;
};

export const requireHR = (context: GraphQLContext): AuthUser => {
  return requireRole(context, 'HR');
};

export const requireCandidate = (context: GraphQLContext): AuthUser => {
  return requireRole(context, 'CANDIDATE');
};

export const optionalAuth = (context: GraphQLContext): AuthUser | null => {
  return context.user;
};
