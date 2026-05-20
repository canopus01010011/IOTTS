import type { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reportService.js';

export class ReportController {
  /**
   * GET /api/reports/missions
   */
  static async getMissionReport(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : null,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : null,
        status: req.query.status as string,
        technicianId: req.query.technicianId as string,
        driverId: req.query.driverId as string,
        equipmentId: req.query.equipmentId as string,
      };

      const result = await ReportService.getMissionReport(filters, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/export/excel
   */
  static async exportToExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : null,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : null,
        status: req.query.status as string,
        technicianId: req.query.technicianId as string,
        driverId: req.query.driverId as string,
        equipmentId: req.query.equipmentId as string,
      };

      const buffer = await ReportService.exportMissionsToExcel(filters);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=missions-report.xlsx');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/list
   */
  static async getTechnicianReports(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;

      const result = await ReportService.getTechnicianReports({ status }, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/detail/:missionId
   */
  static async getSubmissionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.params;
      const result = await ReportService.isMissionReportSubmitted(missionId as string);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getReportDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.params;
      const data = await ReportService.getReportByMissionId(missionId as string);
      res.json({ success: true, data });
    } catch (error) {
      if (error instanceof Error && error.message === 'Mission not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
}