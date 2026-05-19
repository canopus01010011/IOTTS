import axios from 'axios';
import FormData from 'form-data';

interface AIValidationResponse {
  valid: boolean;
  score: number;
  issues: string[];
  blur_score?: number;
  brightness_score?: number;
  resolution?: { width: number; height: number };
  clip?: {
   accepted: boolean;
   equipment_score: number;
   best_label: string;
   best_score: number;
  };
}

export class AIService {
  private static AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  /**
   * Validate photo quality using AI microservice
   */
  static async validatePhoto(fileBuffer: Buffer, filename: string): Promise<AIValidationResponse> {
    try {
      const formData = new FormData();
      formData.append('photo', fileBuffer, filename);

      const response = await axios.post(`${this.AI_URL}/validate-photo`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 10000, // 10 seconds timeout
      });

      return {
        valid: response.data.valid,
        score: response.data.score,
        issues: response.data.issues || [],
        blur_score: response.data.blur_score,
        brightness_score: response.data.brightness_score,
        resolution: response.data.resolution,
	clip: response.data.clip,
      };
    } catch (error) {
      console.error('❌ AI Service error:', error);
      // Fallback: accept photo if AI is down
      return {
        valid: true,
        score: 0.5,
        issues: ['AI service unavailable, photo accepted by default'],
      };
    }
  }

  /**
   * Quick validation without AI (basic checks)
   */
  static quickValidate(fileBuffer: Buffer): AIValidationResponse {
    // Check file size (at least 10KB)
    if (fileBuffer.length < 10 * 1024) {
      return {
        valid: false,
        score: 0,
        issues: ['Photo is too small or corrupted'],
      };
    }

    return {
      valid: true,
      score: 0.5,
      issues: [],
    };
  }
}