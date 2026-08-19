import { validateBody, validateQuery, validateParams } from '../shared/middleware/validation-middleware';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../shared/error';

// Mock Express types
interface MockRequest extends Request {
  body?: any;
  query?: any;
  params?: any;
}

interface MockResponse extends Partial<Response> {
  status?: jest.Mock;
  json?: jest.Mock;
}

interface MockNextFunction extends NextFunction {
  (error?: any): void;
}

describe('Validation Middleware', () => {
  let mockReq: MockRequest;
  let mockRes: MockResponse;
  let mockNext: jest.MockedFunction<MockNextFunction>;

  beforeEach(() => {
    mockReq = {} as MockRequest;
    mockRes = {} as MockResponse;
    mockNext = jest.fn();
  });

  describe('validateBody', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      age: z.number().min(0).max(120),
      email: z.string().email().optional(),
    });

    it('should call next() with valid data', () => {
      mockReq.body = { name: 'Test', age: 25 };
      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.body).toEqual({ name: 'Test', age: 25 });
    });

    it('should throw BadRequestError with invalid data', () => {
      mockReq.body = { name: '', age: -5 };
      const middleware = validateBody(testSchema);
      
      expect(() => {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(BadRequestError);
      
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError with missing required fields', () => {
      mockReq.body = { age: 25 };
      const middleware = validateBody(testSchema);
      
      expect(() => {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(BadRequestError);
    });
  });

  describe('validateQuery', () => {
    const querySchema = z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20),
    });

    it('should parse and validate query parameters', () => {
      mockReq.query = { page: '1', limit: '20' };
      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.query).toEqual({ page: 1, limit: 20 });
    });

    it('should use defaults for missing optional fields', () => {
      mockReq.query = {};
      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.query).toEqual({ page: 1, limit: 20 });
    });

    it('should throw BadRequestError with invalid query', () => {
      mockReq.query = { page: '-1', limit: 'abc' };
      const middleware = validateQuery(querySchema);
      
      expect(() => {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(BadRequestError);
    });
  });

  describe('validateParams', () => {
    const paramSchema = z.object({
      id: z.string().min(1),
      semester: z.string().regex(/^\d{4}[ws]$/),
    });

    it('should validate path parameters', () => {
      mockReq.params = { id: '123', semester: '2024w' };
      const middleware = validateParams(paramSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw BadRequestError with invalid params', () => {
      mockReq.params = { id: '', semester: 'invalid' };
      const middleware = validateParams(paramSchema);
      
      expect(() => {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(BadRequestError);
    });
  });
});
