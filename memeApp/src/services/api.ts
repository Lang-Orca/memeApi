import { Platform } from 'react-native';
import { MemeGenerateRequest, MemeGenerateResponse } from '../types/meme';

// On Android Emulator, 10.0.2.2 maps to the host machine's localhost (127.0.0.1)
const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const api = {
  /**
   * Send text prompt and context to generate a meme
   */
  generateMeme: async (requestData: MemeGenerateRequest): Promise<MemeGenerateResponse> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson?.error?.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API generateMeme Error:', error);
      throw error;
    }
  },

  /**
   * Upload an audio file to generate a meme
   */
  generateMemeWithAudio: async (
    audioFilePath: string,
    context: string,
    prompt: string
  ): Promise<MemeGenerateResponse> => {
    try {
      const formData = new FormData();
      
      const uriParts = audioFilePath.split('/');
      const fileName = uriParts[uriParts.length - 1] || 'audio_meme.mp4';
      
      // React Native FormData file upload convention
      formData.append('audio', {
        uri: Platform.OS === 'android' ? audioFilePath : audioFilePath.replace('file://', ''),
        type: 'audio/mp4',
        name: fileName,
      } as any);

      formData.append('context', context);
      formData.append('user_prompt', prompt);
      formData.append('temperature', '0.7');

      const response = await fetch(`${BACKEND_URL}/api/new`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson?.error?.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API generateMemeWithAudio Error:', error);
      throw error;
    }
  },

  /**
   * Healthcheck helper
   */
  checkConnection: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/`);
      return response.ok;
    } catch {
      return false;
    }
  }
};
