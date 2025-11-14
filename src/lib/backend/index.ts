// Backend utilities exports
export * from "./auth";
export * from "./prisma";
export * from "./api";
export * from "./api/config";
export * from "./api/rateLimiter";
export * from "./services/openRouterService";
export * from "./services/documentProcessor";
export * from "./services/onedriveService";
export * from "./pacerCodes";
export {
  getStripe,
  formatPrice,
  fetchTokenPackages,
  fetchWallet,
  consumeTokens,
  type TokenPackage,
  type Wallet,
  type TokenTransaction,
  type UserRole,
  createPaymentIntent as createPaymentIntentClient,
} from "./stripeService";
export * from "./stripeServer";

// Utils
export * from "./utils/errors";
export * from "./utils/response";
export * from "./utils/validation";

// Repositories
// Note: Wallet and TokenTransaction types are exported from stripeService.ts (frontend types)
// Repository types are available but conflict is resolved by using namespaced imports
export * from "./repositories/pricing/tokenPackageRepository";
export * from "./repositories/common/userRepository";
export {
  findWalletByUserId,
  createWallet,
  findOrCreateWallet,
  createWalletWithStarterTokens,
  type Wallet as WalletRepo,
} from "./repositories/purchase/walletRepository";
export * from "./repositories/attorney/blogRepository";
export * from "./repositories/attorney/conversationRepository";
export * from "./repositories/attorney/messageRepository";
export * from "./repositories/attorney/consultationRequestRepository";
export * from "./repositories/attorney/documentQueryRepository";
export * from "./repositories/attorney/chatSessionRepository";
export * from "./repositories/attorney/chatMessageRepository";
export * from "./repositories/attorney/embeddingJobRepository";
export * from "./repositories/attorney/notificationRepository";
export * from "./repositories/attorney/lawyerProfileRepository";
export * from "./repositories/attorney/purchaseRepository";
export {
  createTokenTransaction,
  getTokenTransactionsByUserId,
  aggregateTokenTransactions,
  type TokenTransaction as TokenTransactionRepo,
} from "./repositories/attorney/tokenTransactionRepository";
export * from "./repositories/admin/adminProfileRepository";
export * from "./repositories/admin/adminRepository";
export * from "./repositories/admin/dashboardRepository";
export * from "./repositories/admin/featureRepository";
export {
  findRolePricingById,
  findRolePricingByPackageAndRole,
  updateRolePricing as updateRolePricingRepo,
  deleteRolePricing as deleteRolePricingRepo,
} from "./repositories/admin/rolePricingRepository";
export * from "./repositories/admin/adminActivityRepository";

// Utils
export * from "./utils/attorneyAuth";
export * from "./utils/clientAuth";
export * from "./utils/adminAuth";

// Controllers - Demo & Guest
export * from "./controllers/demo/legalResearchController";
export * from "./controllers/demo/documentAnalysisController";
export * from "./controllers/guest/legalResearchController";
export * from "./controllers/pricing/packagesController";
export * from "./controllers/pricing/rolePricingController";
export * from "./controllers/purchase/purchaseController";

// Controllers - Attorney
export * from "./controllers/attorney/blog/blogController";
export * from "./controllers/attorney/blog/blogPublishController";
export * from "./controllers/attorney/conversations/conversationsController";
export * from "./controllers/attorney/conversations/conversationMessagesController";
export * from "./controllers/attorney/messages/messagesController";
export * from "./controllers/attorney/directory/directoryController";
export * from "./controllers/attorney/notifications/notificationsController";
export * from "./controllers/attorney/profile/profileController";
export * from "./controllers/attorney/queryHistory/queryHistoryController";
export * from "./controllers/attorney/tokenPackages/tokenPackagesController";
export * from "./controllers/attorney/wallet/walletController";
export * from "./controllers/attorney/onedrive/onedriveAuthController";
export * from "./controllers/attorney/onedrive/onedriveController";
export * from "./controllers/attorney/stripe/stripePaymentController";
export * from "./controllers/attorney/stripe/stripeWebhookController";
export * from "./controllers/attorney/documentAnalysis/documentAnalysisController";
export * from "./controllers/attorney/legalResearch/legalResearchController";
export * from "./controllers/attorney/documentProcessing/documentProcessingController";
export * from "./controllers/attorney/documentProcessing/documentChatController";
export * from "./controllers/attorney/documentProcessing/fileContentController";
export * from "./controllers/attorney/documentProcessing/documentSessionController";

// Controllers - Client
export { handleListAttorneys } from "./controllers/client/attorneys/attorneysController";
export { handleGetBlogPosts } from "./controllers/client/blog/blogPostsController";
export {
  handleCreateConsultationRequest,
  handleListConsultationRequests,
} from "./controllers/client/consultationRequests/consultationRequestsController";
export {
  handleGetConsultationRequest,
  handleUpdateConsultationRequestStatus,
} from "./controllers/client/consultationRequests/consultationRequestDetailsController";
export { handleGetConversations as handleGetClientConversations } from "./controllers/client/conversations/conversationsController";
export {
  handleDocumentAnalysis as handleClientDocumentAnalysis,
  handleGetDocumentAnalysisHistory as handleGetClientDocumentAnalysisHistory,
} from "./controllers/client/documentAnalysis/documentAnalysisController";
export { handleLegalResearch as handleClientLegalResearch } from "./controllers/client/legalResearch/legalResearchController";
export {
  handleGetMessages as handleGetClientMessages,
  handleSendMessage as handleSendClientMessage,
} from "./controllers/client/messages/messagesController";
export { handleGetUnreadCounts } from "./controllers/client/notifications/notificationsController";
export {
  handleGetProfile as handleGetClientProfile,
  handleUpdateProfile as handleUpdateClientProfile,
} from "./controllers/client/profile/profileController";
export * from "./controllers/client/tokens/tokenBalanceController";
export * from "./controllers/client/tokens/tokenTransactionsController";
export * from "./controllers/client/tokens/tokenUsageController";
export { handleCreatePaymentIntent as handleCreateClientPaymentIntent } from "./controllers/client/stripe/stripePaymentController";
export * from "./controllers/client/upload/uploadController";

// Controllers - Admin
export { handleGetProfile as handleGetAdminProfile } from "./controllers/admin/profile/profileController";
export * from "./controllers/admin/admins/adminsController";
export * from "./controllers/admin/dashboard/dashboardStatsController";
export * from "./controllers/admin/dashboard/dashboardActivityController";
export * from "./controllers/admin/dashboard/dashboardTokenUsageController";
export * from "./controllers/admin/dashboard/dashboardTopConsumersController";
export * from "./controllers/admin/features/featuresController";
export * from "./controllers/admin/features/featureToggleController";
export * from "./controllers/admin/features/featureCheckController";
export {
  handleListPackages as handleAdminListPackages,
  handleCreatePackage as handleAdminCreatePackage,
} from "./controllers/admin/pricing/packagesController";
export {
  handleUpdatePackage as handleAdminUpdatePackage,
  handleDeletePackage as handleAdminDeletePackage,
} from "./controllers/admin/pricing/packageManagementController";
export { handleGetRolePricing as handleAdminGetRolePricing } from "./controllers/admin/pricing/rolePricingController";
export {
  handleUpdateRolePricing as handleAdminUpdateRolePricing,
  handleDeleteRolePricing as handleAdminDeleteRolePricing,
} from "./controllers/admin/pricing/rolePricingManagementController";
export * from "./controllers/admin/logs/logsController";
export * from "./controllers/admin/logs/logsExportController";

// Controllers - Auth
export * from "./controllers/auth/registrationController";
export * from "./controllers/auth/onedriveOAuthController";

// Services - Demo & Guest
export * from "./services/demo/legalResearchService";
export * from "./services/demo/documentAnalysisService";
export * from "./services/guest/legalResearchService";
export * from "./services/pricing/packagesService";
export * from "./services/pricing/rolePricingService";
export * from "./services/purchase/purchaseService";

// Services - Attorney
export * from "./services/attorney/blog/blogService";
export * from "./services/attorney/conversations/conversationsService";
export * from "./services/attorney/messages/messagesService";
export * from "./services/attorney/directory/directoryService";
export * from "./services/attorney/notifications/notificationsService";
export * from "./services/attorney/profile/profileService";
export * from "./services/attorney/queryHistory/queryHistoryService";
export * from "./services/attorney/tokenPackages/tokenPackagesService";
export {
  getWallet,
  consumeTokens as consumeTokensService,
} from "./services/attorney/wallet/walletService";
export * from "./services/attorney/onedrive/onedriveAuthService";
export * from "./services/attorney/onedrive/onedriveService";
export { createPaymentIntent as createPaymentIntentService } from "./services/attorney/stripe/stripePaymentService";
export * from "./services/attorney/stripe/stripeWebhookService";
export * from "./services/attorney/documentAnalysis/documentAnalysisService";
export * from "./services/attorney/legalResearch/legalResearchService";
export * from "./services/attorney/documentProcessing/documentProcessingService";
export * from "./services/attorney/documentProcessing/documentChatService";
export * from "./services/attorney/documentProcessing/fileContentService";
export * from "./services/attorney/documentProcessing/documentSessionService";

// Services - Client
export * from "./services/client/attorneys/attorneysService";
export * from "./services/client/blog/blogPostsService";
export * from "./services/client/consultationRequests/consultationRequestsService";
export * from "./services/client/conversations/conversationsService";
export * from "./services/client/documentAnalysis/documentAnalysisService";
export {
  performClientLegalResearch,
  type LegalResearchRequest as ClientLegalResearchRequest,
} from "./services/client/legalResearch/legalResearchService";
export * from "./services/client/messages/messagesService";
export * from "./services/client/notifications/notificationsService";
export * from "./services/client/profile/profileService";
export * from "./services/client/tokens/tokenBalanceService";
export * from "./services/client/tokens/tokenTransactionsService";
export * from "./services/client/tokens/tokenUsageService";
export { createPaymentIntent as createClientPaymentIntent } from "./services/client/stripe/stripePaymentService";
export * from "./services/client/upload/uploadService";

// Services - Admin
export * from "./services/admin/profile/profileService";
export * from "./services/admin/admins/adminsService";
export * from "./services/admin/dashboard/dashboardStatsService";
export * from "./services/admin/dashboard/dashboardActivityService";
export * from "./services/admin/dashboard/dashboardTokenUsageService";
export * from "./services/admin/dashboard/dashboardTopConsumersService";
export * from "./services/admin/features/featuresService";
export * from "./services/admin/features/featureToggleService";
export * from "./services/admin/features/featureCheckService";
export {
  listPackages as listAdminPackages,
  createPackage as createAdminPackage,
} from "./services/admin/pricing/packagesService";
export {
  updatePackage as updateAdminPackage,
  deletePackage as deleteAdminPackage,
} from "./services/admin/pricing/packageManagementService";
export { getRolePricing as getAdminRolePricing } from "./services/admin/pricing/rolePricingService";
export {
  updateRolePricing as updateAdminRolePricing,
  deleteRolePricing as deleteAdminRolePricing,
} from "./services/admin/pricing/rolePricingManagementService";
export * from "./services/admin/logs/logsService";
export * from "./services/admin/logs/logsExportService";

// Services - Auth
export * from "./services/auth/registrationService";
export * from "./services/auth/onedriveOAuthService";
