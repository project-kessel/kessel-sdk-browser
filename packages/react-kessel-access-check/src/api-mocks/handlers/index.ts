/**
 * Centralized MSW handlers for all test scenarios
 *
 * Import handlers from this file and use server.use() to override
 * default handlers for specific test cases.
 */

import { successHandlers } from './success-handlers';
import { errorHandlers } from './error-handlers';

export { successHandlers, errorHandlers };

// Re-export all handlers as named exports for convenience
export * from './success-handlers';
export * from './error-handlers';
