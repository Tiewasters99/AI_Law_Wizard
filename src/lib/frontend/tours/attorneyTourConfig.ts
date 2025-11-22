export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

export const attorneyTourSteps: TourStep[] = [
  {
    target: "[data-tour='dashboard']",
    title: "Welcome to Your Dashboard",
    content:
      "This is your main dashboard where you can see quick stats and access all features. Use the sidebar to navigate through different sections.",
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
    title: "Directory",
    content:
      "Browse and connect with clients in the directory. Find potential clients and manage your professional network.",
    placement: "right",
  },
  {
    target: "[data-tour='inbox']",
    title: "Inbox",
    content:
      "Manage all your messages and communications with clients. Stay updated with unread message notifications.",
    placement: "right",
  },
  {
    target: "[data-tour='wizard']",
    title: "Document Analysis",
    content:
      "Use AI-powered document analysis to quickly review and analyze legal documents. Upload documents and get instant insights.",
    placement: "right",
  },
  {
    target: "[data-tour='grand-wizard']",
    title: "Advanced Analysis",
    content:
      "Access advanced AI analysis tools for complex legal research and document processing. Perfect for in-depth case analysis.",
    placement: "right",
  },
  {
    target: "[data-tour='query-history']",
    title: "Query History",
    content:
      "View your past queries and analysis history. Access previously analyzed documents and research results.",
    placement: "right",
  },
  {
    target: "[data-tour='docket-genie']",
    title: "Docket Genie",
    content:
      "Access court integration tools to search dockets, track cases, and stay updated with court filings.",
    placement: "right",
  },
  {
    target: "[data-tour='blog']",
    title: "Legal Blog",
    content:
      "Read legal articles, insights, and updates. Stay informed about legal trends and best practices.",
    placement: "right",
  },
  {
    target: "[data-tour='miniverse']",
    title: "Miniverse",
    content:
      "Explore the Miniverse platform for additional legal resources and tools.",
    placement: "right",
  },
  {
    target: "[data-tour='integrations']",
    title: "Integrations",
    content:
      "Connect and manage third-party integrations to enhance your workflow and productivity.",
    placement: "right",
  },
  {
    target: "[data-tour='profile']",
    title: "Profile",
    content:
      "Manage your profile information, settings, and preferences. Keep your professional information up to date.",
    placement: "right",
  },
  {
    target: "[data-tour='tokens']",
    title: "Service Credits",
    content:
      "Monitor and manage your service credits. Purchase additional credits as needed for your legal tools.",
    placement: "right",
  },
];
