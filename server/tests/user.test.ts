import { User } from '../src/models';
import { generateToken, verifyToken } from '../src/middleware/auth';
import { validate, registerSchema, loginSchema } from '../src/utils/validators';

describe('User Model', () => {
  it('should create a user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CANDIDATE' as const,
    };

    const user = new User(userData);
    await user.save();

    expect(user._id).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);
    expect(user.role).toBe(userData.role);
    expect(user.password).not.toBe(userData.password);
  });

  it('should hash password on save', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'HR',
    });

    await user.save();

    expect(user.password).not.toBe('password123');
    expect(user.password.length).toBeGreaterThan(20);
  });

  it('should compare password correctly', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CANDIDATE',
    });

    await user.save();

    const isValid = await user.comparePassword('password123');
    const isInvalid = await user.comparePassword('wrongpassword');

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  it('should not allow duplicate emails', async () => {
    const userData = {
      email: 'duplicate@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CANDIDATE' as const,
    };

    await User.create(userData);

    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should validate email format', async () => {
    const user = new User({
      email: 'invalid-email',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CANDIDATE',
    });

    await expect(user.save()).rejects.toThrow();
  });

  it('should require minimum password length', async () => {
    const user = new User({
      email: 'test@example.com',
      password: '12345',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CANDIDATE',
    });

    await expect(user.save()).rejects.toThrow();
  });

  it('should find user by email', async () => {
    await User.create({
      email: 'findme@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CANDIDATE',
    });

    const foundUser = await User.findByEmail('findme@example.com');
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe('findme@example.com');
  });

  it('should not find deleted user by email', async () => {
    await User.create({
      email: 'deleted@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CANDIDATE',
      isDeleted: true,
    });

    const foundUser = await User.findByEmail('deleted@example.com');
    expect(foundUser).toBeNull();
  });
});

describe('JWT Authentication', () => {
  it('should generate valid JWT token', () => {
    const user = {
      id: '123456789',
      email: 'test@example.com',
      role: 'HR' as const,
    };

    const token = generateToken(user);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should verify and decode valid token', () => {
    const user = {
      id: '123456789',
      email: 'test@example.com',
      role: 'CANDIDATE' as const,
    };

    const token = generateToken(user);
    const decoded = verifyToken(token);

    expect(decoded.id).toBe(user.id);
    expect(decoded.email).toBe(user.email);
    expect(decoded.role).toBe(user.role);
  });

  it('should throw error for invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow();
  });
});

describe('Input Validation', () => {
  it('should validate registration input', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CANDIDATE',
    };

    const result = validate(registerSchema, validInput);
    expect(result).toEqual(validInput);
  });

  it('should reject invalid email in registration', () => {
    const invalidInput = {
      email: 'invalid-email',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CANDIDATE',
    };

    expect(() => validate(registerSchema, invalidInput)).toThrow();
  });

  it('should validate login input', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = validate(loginSchema, validInput);
    expect(result).toEqual(validInput);
  });
});
