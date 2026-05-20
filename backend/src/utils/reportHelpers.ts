import type Report from '../models/Report.js';

export const PLACEHOLDER_DESCRIPTIONS = ['Delivery proof', 'Mission completed', ''];

/** True when the technician has submitted their end-of-mission report. */
export function isTechnicianReportSubmitted(report: Report | null): boolean {
  if (!report) return false;

  const notes = report.notes?.trim();
  if (notes) return true;

  const description = report.description?.trim() || '';
  return (
    description.length > 0 && !PLACEHOLDER_DESCRIPTIONS.includes(description)
  );
}
