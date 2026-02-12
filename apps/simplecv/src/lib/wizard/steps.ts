import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  Globe,
  Award,
  Settings,
  Palette,
} from "lucide-react";

export interface WizardStep {
  id: string;
  icon: typeof User;
  group: "theme" | "content" | "settings";
}

export interface StepGroup {
  id: "theme" | "content" | "settings";
  steps: string[];
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: "visibility", icon: Settings, group: "settings" },
  { id: "template", icon: Palette, group: "theme" },
  { id: "basics", icon: User, group: "content" },
  { id: "summary", icon: FileText, group: "content" },
  { id: "experience", icon: Briefcase, group: "content" },
  { id: "education", icon: GraduationCap, group: "content" },
  { id: "skills", icon: Wrench, group: "content" },
  { id: "languages", icon: Globe, group: "content" },
  { id: "extras", icon: Award, group: "content" },
];

export const STEP_GROUPS: StepGroup[] = [
  { id: "settings", steps: ["visibility"] },
  { id: "theme", steps: ["template"] },
  { id: "content", steps: ["basics", "summary", "experience", "education", "skills", "languages", "extras"] },
];
