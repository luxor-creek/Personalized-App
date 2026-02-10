export type SectionType = 
  | 'headline'
  | 'body'
  | 'video'
  | 'image'
  | 'banner'
  | 'cta'
  | 'form'
  | 'logo'
  | 'document'
  | 'spacer'
  | 'hero'
  | 'heroVideo'
  | 'heroImage'
  | 'heroForm'
  | 'heroBg'
  | 'heroVideoBg'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'stats'
  | 'team'
  | 'logoCloud'
  | 'newsletter'
  | 'comparison'
  | 'steps'
  | 'gallery'
  | 'footer'
  | 'divider'
  | 'quote'
  | 'countdown'
  | 'socialProof'
  | 'benefits'
  | 'cards'
  | 'qrCode';

export interface SectionStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  paddingY?: string;
  paddingX?: string;
  maxWidth?: string;
  borderRadius?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  buttonColor?: string;
  buttonTextColor?: string;
  secondaryButtonColor?: string;
  secondaryButtonTextColor?: string;
  height?: string;
  accentColor?: string;
  borderColor?: string;
  columns?: number;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  buttonText?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface TeamMember {
  name: string;
  role: string;
  imageUrl?: string;
}

export interface ComparisonRow {
  feature: string;
  optionA: string;
  optionB: string;
}

export interface StepItem {
  title: string;
  description: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

export interface SocialProofItem {
  platform: string;
  count: string;
  label: string;
}

export interface CardItem {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface SectionContent {
  text?: string;
  html?: string;
  videoUrl?: string;
  videoId?: string;
  imageUrl?: string;
  imageUrls?: string[];
  imageLayout?: 'single' | 'row';
  logoUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  formTitle?: string;
  formSubtitle?: string;
  formFields?: string[];
  formButtonText?: string;
  bannerText?: string;
  bannerSubtext?: string;
  documentUrl?: string;
  documentTitle?: string;
  documentDescription?: string;
  documentButtonText?: string;
  // Hero
  heroSubheadline?: string;
  heroImageUrl?: string;
  heroBadge?: string;
  // Hero Form
  heroFormFields?: string[];
  heroFormButtonText?: string;
  heroFormTitle?: string;
  // Features
  featureItems?: FeatureItem[];
  // Testimonials
  testimonialItems?: TestimonialItem[];
  // Pricing
  pricingItems?: PricingTier[];
  pricingTitle?: string;
  pricingSubtitle?: string;
  // FAQ
  faqItems?: FaqItem[];
  // Stats
  statItems?: StatItem[];
  // Team
  teamMembers?: TeamMember[];
  teamTitle?: string;
  teamSubtitle?: string;
  // Logo Cloud
  logoUrls?: string[];
  logoCloudTitle?: string;
  // Newsletter
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  newsletterButtonText?: string;
  newsletterPlaceholder?: string;
  // Comparison
  comparisonRows?: ComparisonRow[];
  comparisonHeaderA?: string;
  comparisonHeaderB?: string;
  // Steps
  stepItems?: StepItem[];
  stepsTitle?: string;
  stepsSubtitle?: string;
  // Gallery
  galleryUrls?: string[];
  galleryColumns?: number;
  // Footer
  footerColumns?: FooterColumn[];
  footerCopyright?: string;
  // Divider
  dividerStyle?: 'solid' | 'dashed' | 'dotted' | 'gradient';
  // Quote
  quoteText?: string;
  quoteAuthor?: string;
  quoteRole?: string;
  // Countdown
  countdownDate?: string;
  countdownTitle?: string;
  countdownSubtitle?: string;
  // Social Proof
  socialProofItems?: SocialProofItem[];
  socialProofTitle?: string;
  // Benefits
  benefitItems?: string[];
  benefitsTitle?: string;
  benefitsSubtitle?: string;
  // Cards
  cardItems?: CardItem[];
  cardsTitle?: string;
  // Button visibility
  hideButton?: boolean;
  hideSecondaryButton?: boolean;
  // Form delivery
  formRecipientEmail?: string;
  // QR Code
  qrCodeUrl?: string;
  qrCodeSize?: number;
  qrCodeLabel?: string;
}

export interface BuilderSection {
  id: string;
  type: SectionType;
  content: SectionContent;
  style: SectionStyle;
}

export const SECTION_DEFAULTS: Record<SectionType, { content: SectionContent; style: SectionStyle; label: string; icon: string; category: string }> = {
  // --- Layout ---
  logo: {
    label: 'Logo / Nav',
    icon: 'Sparkles',
    category: 'Layout',
    content: { logoUrl: '' },
    style: { backgroundColor: '#ffffff', paddingY: '24px', height: '60px' },
  },
  hero: {
    label: 'Hero: Headline + Buttons',
    icon: 'Rocket',
    category: 'Layout',
    content: { text: 'Build Something Amazing', heroSubheadline: 'The all-in-one platform to launch your next big idea.', buttonText: 'Get Started', buttonLink: '#', secondaryButtonText: 'Learn More', secondaryButtonLink: '#', heroBadge: 'New', heroImageUrl: '' },
    style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: '96px', textAlign: 'center', fontSize: '56px', fontWeight: 'bold', buttonColor: '#6d54df', buttonTextColor: '#ffffff', secondaryButtonColor: 'transparent', secondaryButtonTextColor: '#ffffff' },
  },
  heroBg: {
    label: 'Hero: Image + Headline + Buttons',
    icon: 'Image',
    category: 'Layout',
    content: { text: 'Build Something Amazing', heroSubheadline: 'The all-in-one platform to launch your next big idea.', buttonText: 'Get Started', buttonLink: '#', secondaryButtonText: 'Learn More', secondaryButtonLink: '#', heroBadge: 'New', imageUrl: '' },
    style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: '96px', textAlign: 'center', fontSize: '56px', fontWeight: 'bold', buttonColor: '#6d54df', buttonTextColor: '#ffffff', secondaryButtonColor: 'transparent', secondaryButtonTextColor: '#ffffff', overlayColor: '#6d54df', overlayOpacity: 0.6 },
  },
  heroVideoBg: {
    label: 'Hero: Video BG + Headline',
    icon: 'Play',
    category: 'Layout',
    content: { text: 'Build Something Amazing', heroSubheadline: 'The all-in-one platform to launch your next big idea.', videoUrl: '', buttonText: 'Get Started', buttonLink: '#', secondaryButtonText: 'Learn More', secondaryButtonLink: '#', heroBadge: 'New' },
    style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: '96px', textAlign: 'center', fontSize: '56px', fontWeight: 'bold', buttonColor: '#6d54df', buttonTextColor: '#ffffff', secondaryButtonColor: 'transparent', secondaryButtonTextColor: '#ffffff', overlayColor: '#000000', overlayOpacity: 0.5 },
  },
  heroVideo: {
    label: 'Hero: Text + Video',
    icon: 'Play',
    category: 'Layout',
    content: { text: 'Your Headline Here', heroSubheadline: 'A compelling subheadline that explains your value proposition.', videoUrl: '' },
    style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: '80px', fontSize: '44px', fontWeight: 'bold', textAlign: 'left' },
  },
  heroImage: {
    label: 'Hero: Text + Image',
    icon: 'Image',
    category: 'Layout',
    content: { text: 'Your Headline Here', heroSubheadline: 'A compelling subheadline that explains your value proposition.', heroImageUrl: '' },
    style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: '80px', fontSize: '44px', fontWeight: 'bold', textAlign: 'left' },
  },
  heroForm: {
    label: 'Hero: Text + Form',
    icon: 'FileText',
    category: 'Layout',
    content: { text: 'Your Headline Here', heroSubheadline: 'A compelling subheadline that explains your value proposition.', heroFormFields: ['First Name', 'Email', 'Company'], heroFormButtonText: 'Get Started', heroFormTitle: 'Get Started Free', formRecipientEmail: '' },
    style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: '80px', fontSize: '44px', fontWeight: 'bold', textAlign: 'left', buttonColor: '#6d54df', buttonTextColor: '#ffffff' },
  },
  footer: {
    label: 'Footer',
    icon: 'PanelBottom',
    category: 'Layout',
    content: { footerColumns: [{ title: 'Product', links: [{ label: 'Features', url: '#' }, { label: 'Pricing', url: '#' }] }, { title: 'Company', links: [{ label: 'About', url: '#' }, { label: 'Blog', url: '#' }] }], footerCopyright: '© 2025 Company. All rights reserved.' },
    style: { backgroundColor: '#0f172a', textColor: '#94a3b8', paddingY: '48px' },
  },
  spacer: {
    label: 'Spacer',
    icon: 'Minus',
    category: 'Layout',
    content: {},
    style: { backgroundColor: '#ffffff', height: '48px' },
  },
  divider: {
    label: 'Divider',
    icon: 'SeparatorHorizontal',
    category: 'Layout',
    content: { dividerStyle: 'solid' },
    style: { backgroundColor: '#ffffff', paddingY: '24px', accentColor: '#e2e8f0' },
  },

  // --- Text ---
  headline: {
    label: 'Headline',
    icon: 'Type',
    category: 'Text',
    content: { text: 'Your Headline Here' },
    style: { fontSize: '48px', fontWeight: 'bold', textAlign: 'center', textColor: '#1a1a1a', backgroundColor: '#ffffff', paddingY: '48px' },
  },
  body: {
    label: 'Body Text',
    icon: 'AlignLeft',
    category: 'Text',
    content: { text: 'Add your body text here. You can describe your product, service, or any other content you want to share with your audience.' },
    style: { fontSize: '18px', fontWeight: 'normal', textAlign: 'left', textColor: '#4a4a4a', backgroundColor: '#ffffff', paddingY: '32px', maxWidth: '800px' },
  },
  quote: {
    label: 'Blockquote',
    icon: 'Quote',
    category: 'Text',
    content: { quoteText: 'The best way to predict the future is to create it.', quoteAuthor: 'Peter Drucker', quoteRole: 'Management Consultant' },
    style: { backgroundColor: '#f8fafc', textColor: '#1a1a1a', paddingY: '48px', maxWidth: '800px', accentColor: '#6d54df', fontSize: '24px' },
  },

  // --- Media ---
  video: {
    label: 'Video Embed',
    icon: 'Play',
    category: 'Media',
    content: { videoUrl: '' },
    style: { backgroundColor: '#000000', paddingY: '48px', maxWidth: '900px' },
  },
  image: {
    label: 'Image',
    icon: 'Image',
    category: 'Media',
    content: { imageUrl: '', imageUrls: [], imageLayout: 'single' },
    style: { backgroundColor: '#ffffff', paddingY: '32px', maxWidth: '900px', borderRadius: '8px' },
  },
  gallery: {
    label: 'Image Gallery',
    icon: 'LayoutGrid',
    category: 'Media',
    content: { galleryUrls: [], galleryColumns: 3 },
    style: { backgroundColor: '#ffffff', paddingY: '48px', maxWidth: '1100px', borderRadius: '8px' },
  },
  banner: {
    label: 'Banner',
    icon: 'RectangleHorizontal',
    category: 'Media',
    content: { bannerText: 'Banner Headline', bannerSubtext: 'Supporting text for your banner', imageUrl: '' },
    style: { backgroundColor: '#6d54df', textColor: '#ffffff', paddingY: '80px', overlayColor: '#000000', overlayOpacity: 0.4, fontSize: '40px', fontWeight: 'bold', textAlign: 'center' },
  },

  // --- Social Proof ---
  testimonials: {
    label: 'Testimonials',
    icon: 'MessageSquareQuote',
    category: 'Social Proof',
    content: { testimonialItems: [{ quote: 'This product changed how we work. Highly recommended!', author: 'Jane Smith', role: 'CEO, Acme Inc.' }, { quote: 'Incredible results from day one. Our team loves it.', author: 'John Doe', role: 'CTO, Startup Co.' }, { quote: 'Simple, powerful, and easy to use. 10/10.', author: 'Sarah Lee', role: 'Director, Agency X' }] },
    style: { backgroundColor: '#f8fafc', textColor: '#1a1a1a', paddingY: '64px', maxWidth: '1100px' },
  },
  logoCloud: {
    label: 'Logo Cloud',
    icon: 'Building2',
    category: 'Social Proof',
    content: { logoUrls: [], logoCloudTitle: 'Trusted by leading companies' },
    style: { backgroundColor: '#ffffff', textColor: '#94a3b8', paddingY: '48px' },
  },
  socialProof: {
    label: 'Social Proof',
    icon: 'ThumbsUp',
    category: 'Social Proof',
    content: { socialProofItems: [{ platform: 'Users', count: '10,000+', label: 'Active users' }, { platform: 'Reviews', count: '4.9/5', label: 'Average rating' }, { platform: 'Countries', count: '50+', label: 'Countries served' }], socialProofTitle: 'Trusted worldwide' },
    style: { backgroundColor: '#f8fafc', textColor: '#1a1a1a', paddingY: '48px', accentColor: '#6d54df' },
  },
  stats: {
    label: 'Stats / Metrics',
    icon: 'BarChart3',
    category: 'Social Proof',
    content: { statItems: [{ value: '99%', label: 'Uptime' }, { value: '50K+', label: 'Customers' }, { value: '200M+', label: 'Requests/day' }, { value: '24/7', label: 'Support' }] },
    style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: '48px', accentColor: '#6d54df' },
  },

  // --- Content ---
  features: {
    label: 'Features Grid',
    icon: 'Grid3x3',
    category: 'Content',
    content: { featureItems: [{ icon: '⚡', title: 'Lightning Fast', description: 'Built for speed from the ground up.' }, { icon: '🔒', title: 'Secure by Default', description: 'Enterprise-grade security baked in.' }, { icon: '🎨', title: 'Beautiful Design', description: 'Pixel-perfect UI components.' }, { icon: '📱', title: 'Fully Responsive', description: 'Looks great on every device.' }, { icon: '🔗', title: 'Easy Integrations', description: 'Connect your favorite tools.' }, { icon: '📊', title: 'Analytics Built-in', description: 'Track everything that matters.' }] },
    style: { backgroundColor: '#ffffff', textColor: '#1a1a1a', paddingY: '64px', maxWidth: '1100px', columns: 3 },
  },
  steps: {
    label: 'How It Works',
    icon: 'ListOrdered',
    category: 'Content',
    content: { stepsTitle: 'How It Works', stepsSubtitle: 'Get started in three simple steps', stepItems: [{ title: 'Sign Up', description: 'Create your account in less than 60 seconds.' }, { title: 'Configure', description: 'Set up your workspace and invite your team.' }, { title: 'Launch', description: 'Go live and start seeing results immediately.' }] },
    style: { backgroundColor: '#ffffff', textColor: '#1a1a1a', paddingY: '64px', maxWidth: '900px', accentColor: '#6d54df' },
  },
  benefits: {
    label: 'Benefits List',
    icon: 'CheckSquare',
    category: 'Content',
    content: { benefitsTitle: 'Why Choose Us', benefitsSubtitle: 'Everything you need to succeed', benefitItems: ['No credit card required', 'Free 14-day trial', 'Cancel anytime', '24/7 customer support', 'Unlimited projects', '99.9% uptime guarantee'] },
    style: { backgroundColor: '#ffffff', textColor: '#1a1a1a', paddingY: '64px', maxWidth: '700px', accentColor: '#22c55e' },
  },
  comparison: {
    label: 'Comparison Table',
    icon: 'Columns2',
    category: 'Content',
    content: { comparisonHeaderA: 'Us', comparisonHeaderB: 'Others', comparisonRows: [{ feature: 'Pricing', optionA: 'Affordable', optionB: 'Expensive' }, { feature: 'Support', optionA: '24/7', optionB: 'Business hours' }, { feature: 'Setup Time', optionA: 'Minutes', optionB: 'Days' }] },
    style: { backgroundColor: '#ffffff', textColor: '#1a1a1a', paddingY: '48px', maxWidth: '800px', accentColor: '#6d54df' },
  },
  cards: {
    label: 'Content Cards',
    icon: 'SquareStack',
    category: 'Content',
    content: { cardsTitle: 'Our Services', cardItems: [{ title: 'Consulting', description: 'Expert advice for your business growth.', imageUrl: '' }, { title: 'Development', description: 'Custom solutions built to scale.', imageUrl: '' }, { title: 'Design', description: 'Beautiful interfaces your users will love.', imageUrl: '' }] },
    style: { backgroundColor: '#f8fafc', textColor: '#1a1a1a', paddingY: '64px', maxWidth: '1100px', columns: 3 },
  },

  // --- Conversion ---
  cta: {
    label: 'Call to Action',
    icon: 'MousePointerClick',
    category: 'Conversion',
    content: { text: 'Ready to get started?', buttonText: 'Get Started', buttonLink: '#', secondaryButtonText: '', secondaryButtonLink: '' },
    style: { backgroundColor: '#f8f8f8', textColor: '#1a1a1a', paddingY: '64px', textAlign: 'center', fontSize: '32px', fontWeight: 'bold', buttonColor: '#6d54df', buttonTextColor: '#ffffff', secondaryButtonColor: 'transparent', secondaryButtonTextColor: '#6d54df' },
  },
  form: {
    label: 'Contact Form',
    icon: 'FileText',
    category: 'Conversion',
    content: { formTitle: 'Get in Touch', formSubtitle: 'Fill out the form below and we\'ll get back to you.', formFields: ['First Name', 'Email', 'Message'], formButtonText: 'Submit' },
    style: { backgroundColor: '#ffffff', textColor: '#1a1a1a', paddingY: '48px', maxWidth: '600px', buttonColor: '#6d54df', buttonTextColor: '#ffffff' },
  },
  newsletter: {
    label: 'Newsletter Signup',
    icon: 'Mail',
    category: 'Conversion',
    content: { newsletterTitle: 'Stay in the loop', newsletterSubtitle: 'Get the latest updates delivered to your inbox.', newsletterButtonText: 'Subscribe', newsletterPlaceholder: 'Enter your email' },
    style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: '64px', maxWidth: '600px', buttonColor: '#6d54df', buttonTextColor: '#ffffff' },
  },
  document: {
    label: 'Document Download',
    icon: 'FileDown',
    category: 'Conversion',
    content: { documentUrl: '', documentTitle: 'Download Our Guide', documentDescription: 'Get the full PDF with all the details.', documentButtonText: 'Download PDF' },
    style: { backgroundColor: '#f8f8f8', textColor: '#1a1a1a', paddingY: '48px', maxWidth: '700px', buttonColor: '#6d54df', buttonTextColor: '#ffffff' },
  },
  countdown: {
    label: 'Countdown Timer',
    icon: 'Timer',
    category: 'Conversion',
    content: { countdownDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], countdownTitle: 'Launch Day Is Coming', countdownSubtitle: 'Don\'t miss out on our exclusive launch offer.' },
    style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: '64px', accentColor: '#6d54df' },
  },

  // --- People ---
  pricing: {
    label: 'Pricing Table',
    icon: 'CreditCard',
    category: 'Commerce',
    content: { pricingTitle: 'Simple Pricing', pricingSubtitle: 'No hidden fees. Cancel anytime.', pricingItems: [{ name: 'Starter', price: '$9', period: '/mo', features: ['5 projects', '1 user', 'Basic support'], buttonText: 'Start Free' }, { name: 'Pro', price: '$29', period: '/mo', features: ['Unlimited projects', '10 users', 'Priority support', 'Analytics'], highlighted: true, buttonText: 'Get Pro' }, { name: 'Enterprise', price: '$99', period: '/mo', features: ['Everything in Pro', 'Unlimited users', 'Dedicated support', 'Custom integrations', 'SLA'], buttonText: 'Contact Us' }] },
    style: { backgroundColor: '#ffffff', textColor: '#1a1a1a', paddingY: '64px', maxWidth: '1100px', buttonColor: '#6d54df', buttonTextColor: '#ffffff', accentColor: '#6d54df' },
  },
  faq: {
    label: 'FAQ',
    icon: 'HelpCircle',
    category: 'Content',
    content: { faqItems: [{ question: 'How do I get started?', answer: 'Sign up for a free account and follow our quick setup guide.' }, { question: 'Can I cancel anytime?', answer: 'Yes, you can cancel your subscription at any time with no penalties.' }, { question: 'Do you offer support?', answer: 'We offer 24/7 support via email and live chat.' }] },
    style: { backgroundColor: '#ffffff', textColor: '#1a1a1a', paddingY: '64px', maxWidth: '800px', accentColor: '#6d54df' },
  },
  team: {
    label: 'Team Members',
    icon: 'Users',
    category: 'People',
    content: { teamTitle: 'Meet the Team', teamSubtitle: 'The people behind the product', teamMembers: [{ name: 'Alex Johnson', role: 'CEO & Founder', imageUrl: '' }, { name: 'Maria Garcia', role: 'CTO', imageUrl: '' }, { name: 'Sam Williams', role: 'Head of Design', imageUrl: '' }] },
    style: { backgroundColor: '#ffffff', textColor: '#1a1a1a', paddingY: '64px', maxWidth: '1000px' },
  },
  qrCode: {
    label: 'QR Code',
    icon: 'QrCode',
    category: 'Conversion',
    content: { qrCodeUrl: 'https://example.com', qrCodeSize: 200, qrCodeLabel: 'Scan to visit' },
    style: { backgroundColor: '#ffffff', textColor: '#1a1a1a', paddingY: '48px', textAlign: 'center' },
  },
};

export const FONT_SIZES = ['14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px', '48px', '56px', '64px', '72px'];
export const FONT_WEIGHTS = ['normal', 'medium', 'semibold', 'bold', 'extrabold'];
export const TEXT_ALIGNS = ['left', 'center', 'right'];
export const PADDING_OPTIONS = ['0px', '16px', '24px', '32px', '48px', '64px', '80px', '96px', '128px'];

export const SECTION_CATEGORIES = ['Layout', 'Text', 'Media', 'Social Proof', 'Content', 'Conversion', 'Commerce', 'People'] as const;
