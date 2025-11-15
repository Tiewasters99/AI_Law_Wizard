// Service for attorney directory functionality

import { findConsultationRequestsByAttorneyId } from "../../../repositories/attorney/consultationRequestRepository";
import { findUserByIdWithWallet } from "../../../repositories/common/userRepository";
import { prisma } from "../../../prisma";

/**
 * Get client directory for an attorney
 */
export async function getClientDirectory(attorneyId: string) {
  // Fetch consultation requests for this attorney
  const consultationRequests =
    await findConsultationRequestsByAttorneyId(attorneyId);

  // Get unique client IDs
  const clientIds = [...new Set(consultationRequests.map(req => req.clientId))];

  // Fetch client details
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: clientIds,
      },
      role: "CUSTOMER",
      profileComplete: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      profileData: true,
      createdAt: true,
      customerProfile: {
        select: {
          companyName: true,
          address: true,
          phone: true,
          industry: true,
          needs: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Attach consultation request info to each user
  return users.map(user => {
    const userRequests = consultationRequests.filter(
      req => req.clientId === user.id
    );
    return {
      ...user,
      consultationRequests: userRequests,
    };
  });
}
