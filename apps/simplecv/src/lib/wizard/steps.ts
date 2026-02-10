import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  Globe,
  Award,
  Settings,
} from "lucide-react";

export interface WizardStep {
  id: string;
  icon: typeof User;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: "visibility", icon: Settings },
  { id: "basics", icon: User },
  { id: "summary", icon: FileText },
  { id: "experience", icon: Briefcase },
  { id: "education", icon: GraduationCap },
  { id: "skills", icon: Wrench },
  { id: "languages", icon: Globe },
  { id: "extras", icon: Award },
];
