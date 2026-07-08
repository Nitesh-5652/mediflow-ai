import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
process.env.CLERK_SECRET_KEY = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.GEMINI_API_KEY = 'test-gemini';
process.env.RESEND_API_KEY = 'test-resend';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';
