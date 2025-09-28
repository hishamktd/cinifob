import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/register/route';

// Mock the modules before import
vi.mock('@core/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}));

// Import the mocked modules
import { prisma } from '@core/lib/prisma';
import bcrypt from 'bcryptjs';

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new user successfully', async () => {
    const mockRequest = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date(),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('User created successfully');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  });

  it('returns error if email already exists', async () => {
    const mockRequest = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'existing@example.com',
      name: 'Existing User',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User already exists with this email');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const mockRequest = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        // Missing password
      }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation error');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const mockRequest = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation error');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    const mockRequest = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123', // Too short
        name: 'Test User',
      }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation error');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('handles database errors', async () => {
    const mockRequest = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
    vi.mocked(prisma.user.create).mockRejectedValue(new Error('Database error'));

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
