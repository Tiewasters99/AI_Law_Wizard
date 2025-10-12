export interface RoleCardData {
  emoji: string;
  title: string;
  features: string[];
  buttonText: string;
  buttonColor: 'blue' | 'green';
  role: 'client' | 'attorney';
}

export interface FeatureTab {
  name: string;
  href: string;
  description?: string;
}

export interface LandingPageProps {
  // No props needed for static page
}

export interface HeaderProps {
  onSignInClick: () => void;
}

export interface HeroProps {
  headline: string;
  subtext: string;
}

export interface RoleCardsProps {
  onRoleSelect: (role: 'client' | 'attorney') => void;
}

export interface FeaturePreviewProps {
  title: string;
  tabs: FeatureTab[];
  caption: string;
}

export interface FooterProps {
  links: Array<{
    text: string;
    href: string;
  }>;
}
