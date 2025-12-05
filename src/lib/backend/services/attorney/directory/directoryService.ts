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

  // Get proposals for each consultation request
  const consultationRequestIds = consultationRequests.map(req => req.id);
  const proposals = await prisma.proposal.findMany({
    where: {
      consultationRequestId: {
        in: consultationRequestIds,
      },
    },
    select: {
      id: true,
      consultationRequestId: true,
      status: true,
    },
  });

  // Attach consultation request info and proposal counts to each user
  return users.map(user => {
    const userRequests = consultationRequests.filter(
      req => req.clientId === user.id
    );
    
    // Count proposals for each request
    const requestsWithProposals = userRequests.map(req => {
      const requestProposals = proposals.filter(
        p => p.consultationRequestId === req.id
      );
      return {
        ...req,
        proposalCount: requestProposals.length,
        hasProposal: requestProposals.some(p => p.status === "SENT" || p.status === "ACCEPTED"),
      };
    });

    return {
      ...user,
      consultationRequests: requestsWithProposals,
    };
  });
}
