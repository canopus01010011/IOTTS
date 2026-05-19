import { submitReport } from "../app/services/report.service";

export const useReport = () => {
  const sendReport = async (data: {
    missionId: string;
    text: string;
    images: string[];
  }) => {
    return await submitReport(data);
  };

  return { sendReport };
};
