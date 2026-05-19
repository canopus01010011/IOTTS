
import api from "./api";

export const submitReport = async (data: {
  missionId: string;
  text: string;
  images: string[];
}) => {
  const formData = new FormData();

  formData.append("missionId", data.missionId);
  formData.append("description", data.text);

  data.images.forEach((uri, index) => {
    formData.append("photos", {
      uri,
      name: `photo_${index}.jpg`,
      type: "image/jpeg",
    } as any);
  });

  const response = await api.post<any>("/upload/multiple", formData);
  return response;
};
