"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS, STEP_GROUPS } from "@/lib/wizard/steps";
import type { CvModel } from "@/lib/model/CvModel";

interface WizardSidebarProps {
  activeStep: string;
  onStepSelect: (id: string) => void;
  tabLabels: Record<string, string>;
  groupLabels: Record<string, string>;
  sidebarLabels: { expand: string; collapse: string };
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/** Progress per content step: an item count for list steps, a done flag for the rest. */
type StepProgress = Partial<Record<string, number | boolean>>;

function useStepProgress(): StepProgress {
  const { control } = useFormContext<CvModel>();
  const [name, summary, experience, education, skills, languages, extras] = useWatch({
    control,
    name: ["name", "summary", "experience", "education", "skills", "languages", "extras"],
  });
  return {
    basics: !!name?.trim(),
    summary: !!summary?.trim(),
    experience: experience?.length ?? 0,
    education: education?.length ?? 0,
    skills: skills?.length ?? 0,
    languages: languages?.length ?? 0,
    extras: (extras ?? []).reduce((sum, g) => sum + g.items.length, 0),
  };
}

function isStepDone(progress: number | boolean | undefined): boolean {
  return typeof progress === "number" ? progress > 0 : !!progress;
}

/** Resolve step ids to their WIZARD_STEPS definitions, skipping unknown ids. */
function resolveSteps(ids: readonly string[]) {
  return ids.flatMap((id) => WIZARD_STEPS.find((s) => s.id === id) ?? []);
}

export function WizardSidebar({
  activeStep,
  onStepSelect,
  tabLabels,
  groupLabels,
  sidebarLabels,
  collapsed,
  onToggleCollapse,
}: WizardSidebarProps) {
  const progress = useStepProgress();

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r border-border pr-3 gap-1 sticky top-0 self-start transition-all",
          collapsed ? "w-[48px]" : "w-[200px]",
        )}
      >
        <div className={cn("flex mb-1", collapsed ? "justify-center" : "justify-end")}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center justify-center p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={collapsed ? sidebarLabels.expand : sidebarLabels.collapse}
            aria-label={collapsed ? sidebarLabels.expand : sidebarLabels.collapse}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {STEP_GROUPS.map((group, groupIndex) => {
          const groupSteps = resolveSteps(group.steps);

          return (
            <div key={group.id}>
              {groupIndex > 0 && (
                <div className={cn("border-t border-border", collapsed ? "my-1.5" : "my-2")} />
              )}

              {!collapsed && (
                <div className="px-3 pt-1 pb-1 text-xs font-medium text-muted-foreground">
                  {groupLabels[group.id]}
                </div>
              )}

              {groupSteps.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === activeStep;
                const stepProgress = progress[step.id];
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onStepSelect(step.id)}
                    title={collapsed ? tabLabels[step.id] : undefined}
                    aria-current={isActive ? "step" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md text-sm transition-colors text-left w-full",
                      collapsed ? "px-2 py-2 justify-center" : "px-3 py-2",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{tabLabels[step.id]}</span>}
                    {!collapsed && typeof stepProgress === "number" && stepProgress > 0 && (
                      // Visual only, keeps the button's accessible name equal to the step label
                      <span aria-hidden className="ml-auto text-xs tabular-nums text-muted-foreground">{stepProgress}</span>
                    )}
                    {!collapsed && stepProgress === true && (
                      <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Mobile stepper */}
      <nav className="md:hidden flex gap-1.5 overflow-x-auto scrollbar-hide pt-1 pb-2 px-1">
        {STEP_GROUPS.map((group, groupIndex) =>
          resolveSteps(group.steps).map((step) => {
            const Icon = step.icon;
            const isActive = step.id === activeStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepSelect(step.id)}
                className={cn(
                  "relative flex items-center justify-center shrink-0 w-10 h-10 rounded-full text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                  groupIndex > 0 && step.id === group.steps[0] && "ml-2",
                )}
                title={tabLabels[step.id]}
                aria-label={tabLabels[step.id]}
                aria-current={isActive ? "step" : undefined}
              >
                <Icon className="h-4 w-4" />
                {!isActive && isStepDone(progress[step.id]) && (
                  <span aria-hidden className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                )}
              </button>
            );
          }),
        )}
      </nav>
    </>
  );
}
