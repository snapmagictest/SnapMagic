/**
 * SnapMagic Shared Types
 * Common type definitions used across frontend, backend, and infrastructure
 */

// User and Authentication Types
export interface User {
  username: string;
  sessionId: string;
  event: string;
  permissions: string[];
}

export interface AuthToken {
  username: string;
  sessionId: string;
  event: string;
  issuedAt: string;
  expiresAt: string;
  permissions: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  expiresIn?: number;
  user?: User;
  remaining?: UsageLimits;
  clientIp?: string;
}

// Card Generation Types
export interface CardGenerationRequest {
  action: 'generate_card';
  userPrompt: string;
  template?: string;
}

export interface CardGenerationResponse {
  success: boolean;
  cardData?: CardData;
  error?: string;
  generationTime?: number;
}

export interface CardData {
  imageBase64: string;
  prompt: string;
  template: string;
  timestamp: string;
  id: string;
}

// Video Generation Types
export interface VideoPromptRequest {
  action: 'generate_animation_prompt' | 'optimize_animation_prompt';
  cardImage?: string;
  originalPrompt?: string;
  userPrompt?: string;
}

export interface VideoPromptResponse {
  success: boolean;
  animationPrompt?: string;
  optimizedPrompt?: string;
  error?: string;
}

export interface VideoGenerationRequest {
  action: 'generate_video';
  cardImage: string;
  animationPrompt: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
  generationTime?: number;
}

// Usage Limits
export interface UsageLimits {
  cards: number;
  videos: number;
  prints: number;
}

// API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Configuration Types
export interface AppConfig {
  apiUrl: string;
  templateConfig: string;
  printEnabled: boolean;
  version: string;
  features: string[];
  defaultTemplate: string;
  forceTemplate?: string;
}

export interface SecretsConfig {
  github: {
    repositoryUrl: string;
    token: string;
    branch: string;
  };
  app: {
    name: string;
    region: string;
    passwordProtection: {
      enabled: boolean;
      username: string;
      password: string;
    };
    overrideCode: string;
    features: {
      print: boolean;
    };
  };
  models: {
    novaCanvas: string;
    novaReel: string;
    novaLite: string;
  };
  cardTemplate: {
    eventName: string;
  };
  limits: UsageLimits;
}

// Event Types for Frontend
export type AppEvent = 
  | 'card-generated'
  | 'video-generated'
  | 'user-login'
  | 'user-logout'
  | 'error-occurred'
  | 'loading-start'
  | 'loading-end';

export interface AppEventData {
  type: AppEvent;
  payload?: any;
  timestamp: string;
}
