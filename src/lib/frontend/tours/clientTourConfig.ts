import { TourStep } from "./attorneyTourConfig";

export const clientTourSteps: TourStep[] = [
  {
    target: "[data-tour='dashboard']",
    title: "Welcome to Your Dashboard",
    content:
      "This is your main dashboard where you can start your legal consultation. Describe your issue or question to get started with AI-powered legal assistance.",
    placement: "center",
  },
  {
    target: "[data-tour='sidebar']",
    title: "Navigation Sidebar",
    content:
      "The sidebar contains all your navigation options. You can collapse it using the toggle button. All features are organized into sections for easy access.",
    placement: "right",
  },
  {
    target: "[data-tour='directory']",
    title: "Find Attorney",
    content:
      "Search and find qualified attorneys who can help with your legal needs. Browse attorney profiles and connect with legal professionals.",
    placement: "right",
  },
  {
    target: "[data-tour='wizard']",
    title: "Legal Assistant",
    content:
      "Get instant legal assistance using our AI-powered legal assistant. Ask questions and get guidance on your legal matters.",
    placement: "right",
  },
  {
    target: "[data-tour='grand-wizard']",
    title: "Advanced Assistant",
    content:
      "Access advanced AI assistance for complex legal questions and detailed analysis. Perfect for in-depth legal research.",
    placement: "right",
  },
  {
    target: "[data-tour='document-assistant']",
    title: "Document Assistant",
    content:
      "Upload and analyze legal documents. Get insights and explanations about your documents from our AI assistant.",
    placement: "right",
  },
  {
    target: "[data-tour='chat-history']",
    title: "Chat History",
    content:
      "View your past conversations and consultations. Access previous legal advice and analysis results.",
    placement: "right",
  },
  {
    target: "[data-tour='inbox']",
    title: "Messages",
    content:
      "Communicate with attorneys and manage your messages. Stay updated with responses and important communications.",
    placement: "right",
  },
  {
    target: "[data-tour='integrations']",
    title: "My Documents",
    content:
      "Manage your uploaded documents and files. Organize your legal documents in one place.",
    placement: "right",
  },
  {
    target: "[data-tour='blog']",
    title: "Legal Blog",
    content:
      "Read legal articles and educational content. Learn about legal topics and stay informed.",
    placement: "right",
  },
  {
    target: "[data-tour='miniverse']",
    title: "Miniverse",
    content:
      "Explore the Miniverse platform for additional legal resources and community features.",
    placement: "right",
  },
  {
    target: "[data-tour='profile']",
    title: "My Profile",
    content:
      "Manage your profile information and account settings. Keep your personal information up to date.",
    placement: "right",
  },
  {
    target: "[data-tour='tokens']",
    title: "My Credits",
    content:
      "Monitor your service credits balance. Purchase additional credits to continue using AI legal tools.",
    placement: "right",
  },
];

