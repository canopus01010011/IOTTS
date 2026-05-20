import { Confirmation, Mission, Picture, Report, Site, User } from '../models/index.js';
import { isTechnicianReportSubmitted, PLACEHOLDER_DESCRIPTIONS } from '../utils/reportHelpers.js';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';

const submittedReportWhere = {
  [Op.or]: [
    { notes: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] } },
    {
      description: {
        [Op.and]: [
          { [Op.ne]: null },
          { [Op.ne]: '' },
          { [Op.notIn]: PLACEHOLDER_DESCRIPTIONS.filter(Boolean) },
        ],
      },
    },
  ],
};

export class ReportService {
  static async getMissionReport(filters: any, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters.startDate && filters.endDate) {
      where.start_date = { [Op.between]: [filters.startDate, filters.endDate] };
    }
    if (filters.status) where.status = filters.status;
    if (filters.technicianId) where.technician_id = filters.technicianId;
    if (filters.driverId) where.driver_id = filters.driverId;

    const { count, rows } = await Mission.findAndCountAll({
      where,
      include: [
        { model: User, as: 'technician', attributes: ['id', 'full_name'] },
        { model: User, as: 'driver', attributes: ['id', 'full_name'] },
        { model: Site, attributes: ['id', 'name', 'address'] },
      ],
      limit,
      offset,
      order: [['creation_date', 'DESC']],
    });

    const completed = rows.filter(m => m.status === 'completed').length;
    const inProgress = rows.filter(m => m.status === 'in-progress').length;
    const pending = rows.filter(m => m.status === 'pending').length;

    return {
      missions: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      summary: {
        total: count,
        completed,
        inProgress,
        pending,
        completionRate: count > 0 ? ((completed / count) * 100).toFixed(1) : 0,
      },
    };
  }

  static async exportMissionsToExcel(filters: any): Promise<Buffer> {
    const { missions } = await this.getMissionReport(filters, 1, 10000);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Missions');

    worksheet.addRow(['ID', 'Status', 'Technician', 'Driver', 'Equipment List', 'Scheduled Start', 'Start Date', 'End Date']);

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

    for (const mission of missions) {
      worksheet.addRow([
        mission.id,
        mission.status,
        (mission as any).technician?.full_name || 'N/A',
        (mission as any).driver?.full_name || 'N/A',
        (mission as any).equipment_list?.map((e: any) => {
          const name = e.label || e.name || e.type || e.equipment_id;
          return `${name} (x${e.quantity})`;
        }).join(', ') || 'None',
        mission.scheduled_start_date?.toISOString().split('T')[0] || 'N/A',
        mission.start_date?.toISOString().split('T')[0] || 'N/A',
        mission.end_date?.toISOString().split('T')[0] || 'Pending',
      ]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * List technician reports (Report rows linked to missions).
   */
  static async getTechnicianReports(filters: { status?: string }, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const missionWhere: Record<string, unknown> = {};

    if (filters.status) {
      missionWhere.status = filters.status;
    }

    const missionInclude = {
      model: Mission,
      required: true,
      where: Object.keys(missionWhere).length ? missionWhere : undefined,
      include: [
        { model: User, as: 'technician', attributes: ['id', 'full_name', 'phone'] },
        { model: Site, attributes: ['id', 'name', 'address', 'latitude', 'longitude'] },
      ],
    };

    const { count, rows } = await Report.findAndCountAll({
      where: submittedReportWhere,
      include: [missionInclude],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    const totalReports = await Report.count({ where: submittedReportWhere });
    const validated = await Report.count({
      where: submittedReportWhere,
      include: [{ model: Mission, required: true, where: { status: 'completed' } }],
    });
    const awaiting = await Report.count({
      where: submittedReportWhere,
      include: [{
        model: Mission,
        required: true,
        where: { status: { [Op.in]: ['pending', 'in-progress'] } },
      }],
    });

    return {
      reports: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      summary: {
        total: totalReports,
        validated,
        awaiting,
      },
    };
  }

  /**
   * Full report detail for admin (mission + report + photos + confirmation).
   */
  static async getReportByMissionId(missionId: string) {
    const mission = await Mission.findByPk(missionId, {
      include: [
        { model: User, as: 'technician', attributes: ['id', 'full_name', 'phone', 'email'] },
        { model: User, as: 'driver', attributes: ['id', 'full_name', 'phone'] },
        { model: Site },
      ],
    });

    if (!mission) {
      throw new Error('Mission not found');
    }

    const report = await Report.findOne({
      where: { mission_id: missionId },
      include: [{ model: Picture }],
    });

    const confirmation = await Confirmation.findOne({ where: { mission_id: missionId } });

    return { mission, report, confirmation };
  }

  static async isMissionReportSubmitted(missionId: string) {
    const report = await Report.findOne({ where: { mission_id: missionId } });
    return {
      submitted: isTechnicianReportSubmitted(report),
      report: report
        ? {
            id: report.id,
            mission_id: report.mission_id,
            description: report.description,
            notes: report.notes,
            report_date: report.report_date,
          }
        : null,
    };
  }
}
