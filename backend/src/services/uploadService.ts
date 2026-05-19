import cloudinary from '../config/cloudinary.js';
import type { UploadApiResponse } from 'cloudinary';

export class UploadService {
  /**
   * Upload file to Cloudinary
   */
  static async uploadToCloudinary(
    fileBuffer: Buffer,
    folder: string = 'equiptrack'
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadApiResponse);
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Upload equipment photo
   */
  static async uploadEquipmentPhoto(fileBuffer: Buffer, equipmentId: string) {
    return this.uploadToCloudinary(fileBuffer, `equiptrack/equipment/${equipmentId}`);
  }

  /**
   * Upload delivery proof photo
   */
  static async uploadDeliveryPhoto(fileBuffer: Buffer, missionId: string) {
    return this.uploadToCloudinary(fileBuffer, `equiptrack/deliveries/${missionId}`);
  }

  /**
   * Delete file from Cloudinary
   */
  static async deleteFromCloudinary(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}