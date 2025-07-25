/**
 * SnapMagic Shared Constants
 * Application-wide constants used across all modules
 */

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/login',
  TRANSFORM_CARD: '/api/transform-card',
  HEALTH: '/api/health'
} as const;

// Actions
export const ACTIONS = {
  GENERATE_CARD: 'generate_card',
  GENERATE_ANIMATION_PROMPT: 'generate_animation_prompt',
  OPTIMIZE_ANIMATION_PROMPT: 'optimize_animation_prompt',
  GENERATE_VIDEO: 'generate_video'
} as const;

// AWS Configuration
export const AWS_CONFIG = {
  REGION: 'us-east-1',
  MODELS: {
    NOVA_CANVAS: 'amazon.nova-canvas-v1:0',
    NOVA_REEL: 'amazon.nova-reel-v1:1',
    NOVA_LITE: 'amazon.nova-lite-v1:0'
  }
} as const;

// Default Limits
export const DEFAULT_LIMITS = {
  CARDS_PER_USER: 5,
  VIDEOS_PER_USER: 3,
  PRINTS_PER_USER: 1,
  MAX_PROMPT_LENGTH: 500,
  MAX_VIDEO_PROMPT_LENGTH: 200
} as const;

// UI Constants
export const UI_CONSTANTS = {
  LOADING_DELAY: 2000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  MAX_RETRIES: 3
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  NETWORK_ERROR: 'Network error occurred',
  GENERATION_FAILED: 'Generation failed',
  LIMIT_EXCEEDED: 'Usage limit exceeded',
  INVALID_INPUT: 'Invalid input provided',
  SERVER_ERROR: 'Server error occurred'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  CARD_GENERATED: 'Card generated successfully',
  VIDEO_GENERATED: 'Video generated successfully',
  PROMPT_GENERATED: 'Prompt generated successfully'
} as const;

// Template Constants
export const TEMPLATES = {
  DEFAULT: 'cardtemplate',
  PREMIUM: 'cardtemplateEdit'
} as const;

// File Extensions
export const FILE_EXTENSIONS = {
  IMAGE: ['.png', '.jpg', '.jpeg'],
  VIDEO: ['.mp4', '.webm']
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;
