export type SectionType = 
  | 'headline'
  | 'body'
  | 'video'
  | 'image'
  | 'banner'
  | 'cta'
  | 'form'
  | 'logo'
  | 'spacer';

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
}

export interface SectionContent {
  text?: string;
  html?: string;
  videoId?: string;
  imageUrl?: string;
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
}

export interface BuilderSection {
  id: string;
  type: SectionType;
  content: SectionContent;
  style: SectionStyle;
}

export const SECTION_DEFAULTS: Record<SectionType, { content: SectionContent; style: SectionStyle; label: string; icon: string }> = {
  headline: {
    label: 'Headline',
    icon: 'Type',
    content: { text: 'Your Headline Here' },
    style: { fontSize: '48px', fontWeight: 'bold', textAlign: 'center', textColor: '#1a1a1a', backgroundColor: '#ffffff', paddingY: '48px' },
  },
  body: {
    label: 'Body Text',
    icon: 'AlignLeft',
    content: { text: 'Add your body text here. You can describe your product, service, or any other content you want to share with your audience.' },
    style: { fontSize: '18px', fontWeight: 'normal', textAlign: 'left', textColor: '#4a4a4a', backgroundColor: '#ffffff', paddingY: '32px', maxWidth: '800px' },
  },
  video: {
    label: 'Video Embed',
    icon: 'Play',
    content: { videoId: '' },
    style: { backgroundColor: '#000000', paddingY: '48px', maxWidth: '900px' },
  },
  image: {
    label: 'Image',
    icon: 'Image',
    content: { imageUrl: '' },
    style: { backgroundColor: '#ffffff', paddingY: '32px', maxWidth: '900px', borderRadius: '8px' },
  },
  banner: {
    label: 'Banner',
    icon: 'RectangleHorizontal',
    content: { bannerText: 'Banner Headline', bannerSubtext: 'Supporting text for your banner', imageUrl: '' },
    style: { backgroundColor: '#6d54df', textColor: '#ffffff', paddingY: '80px', overlayColor: '#000000', overlayOpacity: 0.4, fontSize: '40px', fontWeight: 'bold', textAlign: 'center' },
  },
  cta: {
    label: 'Call to Action',
    icon: 'MousePointerClick',
    content: { text: 'Ready to get started?', buttonText: 'Get Started', buttonLink: '#', secondaryButtonText: '', secondaryButtonLink: '' },
    style: { backgroundColor: '#f8f8f8', textColor: '#1a1a1a', paddingY: '64px', textAlign: 'center', fontSize: '32px', fontWeight: 'bold', buttonColor: '#6d54df', buttonTextColor: '#ffffff', secondaryButtonColor: 'transparent', secondaryButtonTextColor: '#6d54df' },
  },
  form: {
    label: 'Contact Form',
    icon: 'FileText',
    content: { formTitle: 'Get in Touch', formSubtitle: 'Fill out the form below and we\'ll get back to you.', formFields: ['First Name', 'Email', 'Message'], formButtonText: 'Submit' },
    style: { backgroundColor: '#ffffff', textColor: '#1a1a1a', paddingY: '48px', maxWidth: '600px', buttonColor: '#6d54df', buttonTextColor: '#ffffff' },
  },
  logo: {
    label: 'Logo',
    icon: 'Sparkles',
    content: { logoUrl: '' },
    style: { backgroundColor: '#ffffff', paddingY: '24px', height: '60px' },
  },
  spacer: {
    label: 'Spacer',
    icon: 'Minus',
    content: {},
    style: { backgroundColor: '#ffffff', height: '48px' },
  },
};

export const FONT_SIZES = ['14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px', '48px', '56px', '64px', '72px'];
export const FONT_WEIGHTS = ['normal', 'medium', 'semibold', 'bold', 'extrabold'];
export const TEXT_ALIGNS = ['left', 'center', 'right'];
export const PADDING_OPTIONS = ['0px', '16px', '24px', '32px', '48px', '64px', '80px', '96px', '128px'];
