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
}

export interface StepGroup {
  id: "theme" | "content" | "settings";
  steps: string[];
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: "visibility", icon: Settings },
  { id: "template", icon: Palette },
  { id: "basics", icon: User },
  { id: "summary", icon: FileText },
  { id: "experience", icon: Briefcase },
  { id: "education", icon: GraduationCap },
  { id: "skills", icon: Wrench },
  { id: "languages", icon: Globe },
  { id: "extras", icon: Award },
];

export const STEP_GROUPS: StepGroup[] = [
  { id: "settings", steps: ["visibility"] },
  { id: "theme", steps: ["template"] },
  { id: "content", steps: ["basics", "summary", "experience", "education", "skills", "languages", "extras"] },
];
