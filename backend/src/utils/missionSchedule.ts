/** Drivers may scan at warehouse from 30 minutes before scheduled_start_date. */
export const WAREHOUSE_SCAN_EARLY_MS = 30 * 60 * 1000;

export function assertWarehouseScanAllowed(scheduledStart: Date | string): void {
  const start = new Date(scheduledStart);
  if (Number.isNaN(start.getTime())) {
    throw new Error('Date de début planifiée invalide pour cette mission.');
  }

  const earliest = new Date(start.getTime() - WAREHOUSE_SCAN_EARLY_MS);
  const now = new Date();

  if (now < earliest) {
    const allowedAt = earliest.toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    const plannedAt = start.toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    throw new Error(
      `Scan trop tôt. Prise en charge autorisée à partir de ${allowedAt} (30 min avant le départ planifié ${plannedAt}).`,
    );
  }
}
