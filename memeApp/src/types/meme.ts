export interface MemeGenerateRequest {
  context: string;
  user_prompt: string;
  temperature?: number;
}

export interface MemeGenerateResponse {
  result: {
    memeCaptionTop: string;
    memeCaptionBottom: string;
    imageUrl: string;
    detectedDialect?: string;
  } | string;
}

export interface VibeOption {
  id: string;
  name: string;
  description: string;
  emoji: string;
  culturalVibe: string;
}
