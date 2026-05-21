import axios from 'axios';
import FormData from 'form-data';

export interface AIValidationResponse {
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
   * Validate photo quality using AI microservice (ai_module FastAPI).
   */
  static async validatePhoto(fileBuffer: Buffer, filename: string): Promise<AIValidationResponse> {
    try {
      const formData = new FormData();
      formData.append('photo', fileBuffer, filename);

      const response = await axios.post(`${this.AI_URL}/validate-photo`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000,
      });

      const data = response.data;
      return {
        valid: Boolean(data.valid),
        score: Number(data.score) || 0,
        issues: data.issues || [],
        blur_score: data.blur_score,
        brightness_score: data.brightness_score,
        resolution: data.resolution,
        clip: data.clip,
      };
    } catch (error) {
      console.error('❌ AI Service error:', error);
      const strict = process.env.AI_SERVICE_STRICT !== 'false';
      if (strict) {
        return {
          valid: false,
          score: 0,
          issues: [
            'Service IA indisponible. Démarrez ai_module (uvicorn api:app) et vérifiez AI_SERVICE_URL.',
          ],
        };
      }
      return {
        valid: true,
        score: 0.5,
        issues: ['AI service unavailable, photo accepted by default'],
      };
    }
  }

  static quickValidate(fileBuffer: Buffer): AIValidationResponse {
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
