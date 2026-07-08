import { logger } from '@/lib/logger';
import { config } from '@/lib/env';

describe('Environment Configuration', () => {
  it('should have valid environment variables', () => {
    expect(config.clerk.publishableKey).toBeDefined();
    expect(config.mongodb.uri).toBeDefined();
    expect(config.gemini.apiKey).toBeDefined();
    expect(config.resend.apiKey).toBeDefined();
  });

  it('should have correct app URL', () => {
    expect(config.app.url).toContain('http');
  });

  it('should identify environment correctly', () => {
    expect(config.app.isProduction).toBe(false);
    expect(config.app.isDevelopment).toBe(false); // test environment
  });
});

describe('Logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log info messages', () => {
    logger.info('Test message');
    expect(console.info).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    logger.warn('Test warning');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    const error = new Error('Test error');
    logger.error('Error occurred', error);
    expect(console.error).toHaveBeenCalled();
  });

  it('should set and clear context', () => {
    logger.setContext({ userId: '123', sessionId: 'abc' });
    logger.info('Message with context');
    logger.clearContext();
    logger.info('Message without context');
    expect(console.info).toHaveBeenCalledTimes(2);
  });
});
