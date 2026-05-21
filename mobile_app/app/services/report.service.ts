import api from "./api";

export type PhotoValidation = {
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
};

export async function validateReportPhoto(uri: string): Promise<PhotoValidation> {
  const formData = new FormData();
  formData.append("photo", {
    uri,
    name: "validate.jpg",
    type: "image/jpeg",
  } as unknown as Blob);

  const response = await api.post<{
    success: boolean;
    validation: PhotoValidation;
    message?: string;
  }>("/upload/validate", formData);

  return response.validation;
}

export const submitReport = async (data: {
  missionId: string;
  text: string;
  images: string[];
}) => {
  const formData = new FormData();

  formData.append("missionId", data.missionId);

  if (data.text.trim()) {
    formData.append("description", data.text.trim());
    formData.append("notes", data.text.trim());
  }

  data.images.forEach((uri, index) => {
    formData.append("photos", {
      uri,
      name: `photo_${index}.jpg`,
      type: "image/jpeg",
    } as unknown as Blob);
  });

  return api.post<{
    success: boolean;
    message?: string;
    data?: { validation?: PhotoValidation[] };
  }>("/upload/multiple", formData);
};

export function formatValidationMessage(validation: PhotoValidation): string {
  const lines = [
    `Score IA : ${Math.round(validation.score * 100)}%`,
  ];
  if (validation.clip) {
    lines.push(
      `Équipement : ${validation.clip.best_label} (${Math.round(validation.clip.best_score * 100)}%)`,
    );
  }
  if (validation.issues?.length) {
    lines.push(validation.issues.join("\n"));
  }
  return lines.join("\n");
}
