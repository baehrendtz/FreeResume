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
  { id: "basics", icon: User },
  { id: "summary", icon: FileText },
  { id: "experience", icon: Briefcase },
  { id: "education", icon: GraduationCap },
  { id: "skills", icon: Wrench },
  { id: "languages", icon: Globe },
  { id: "extras", icon: Award },
  { id: "template", icon: Palette },
  { id: "visibility", icon: Settings },
];

/** Groups in the order the user walks through them: fill in the content,
 *  pick a design, then optional fine-tuning. */
export const STEP_GROUPS: StepGroup[] = [
  { id: "content", steps: ["basics", "summary", "experience", "education", "skills", "languages", "extras"] },
  { id: "theme", steps: ["template"] },
  { id: "settings", steps: ["visibility"] },
];

/** Flat step order used by the previous/next navigation. */
export const STEP_ORDER = STEP_GROUPS.flatMap((g) => g.steps);
