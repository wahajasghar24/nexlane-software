import { AppError } from './app-error'

export class DatabaseError extends AppError {
  constructor(originalError: { message?: string; code?: string; details?: string }) {
    super(
      'DATABASE_ERROR',
      originalError.message || 'A database error occurred',
      500,
      { code: originalError.code, details: originalError.details }
    )
    this.name = 'DatabaseError'
  }
}
