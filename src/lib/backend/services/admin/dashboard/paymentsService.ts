// Service for admin dashboard payment statistics

import { getPaymentStats } from "../../../repositories/admin/dashboard/paymentsRepository";

/**
 * Get overall payment statistics
 */
export async function getPayments() {
  return await getPaymentStats();
}
