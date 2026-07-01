export interface TemplateSettings {
  // Background
  bgColor: string;
  bgGradient: boolean;
  bgGradientTo: string;
  // Border
  borderStyle: "none" | "thin" | "double" | "ornate";
  borderColor: string;
  // Header
  schoolName: string;
  // Title
  titleText: string;
  titleColor: string;
  titleFont: "serif" | "sans";
  // Body
  bodyIntro: string;
  bodyCompletion: string;
  // Learner name
  nameColor: string;
  nameFontSize: "xl" | "2xl" | "3xl" | "4xl";
  // Footer
  showDate: boolean;
  showCertNumber: boolean;
  showSignature: boolean;
  signatureName: string;
  signatureTitle: string;
  // Accent
  accentColor: string;
  showAccentBars: boolean;
}

export const DEFAULT_SETTINGS: TemplateSettings = {
  bgColor: "#FFFFFF",
  bgGradient: false,
  bgGradientTo: "#F5FAF5",
  borderStyle: "ornate",
  borderColor: "#2A5230",
  schoolName: "RaeLearn",
  titleText: "Certificate of Completion",
  titleColor: "#1A2E1C",
  titleFont: "serif",
  bodyIntro: "This certifies that",
  bodyCompletion: "has successfully completed",
  nameColor: "#2A5230",
  nameFontSize: "3xl",
  showDate: true,
  showCertNumber: true,
  showSignature: true,
  signatureName: "Rae",
  signatureTitle: "Platform Admin, RaeLearn",
  accentColor: "#2A5230",
  showAccentBars: true,
};
