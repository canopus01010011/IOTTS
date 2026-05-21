import {
  submitReport,
  validateReportPhoto,
} from "@/app/services/report.service";

export const useReport = () => {
  const sendReport = async (data: {
    missionId: string;
    text: string;
    images: string[];
  }) => {
    return await submitReport(data);
  };

  const validatePhoto = async (uri: string) => {
    return await validateReportPhoto(uri);
  };

  return { sendReport, validatePhoto };
};
