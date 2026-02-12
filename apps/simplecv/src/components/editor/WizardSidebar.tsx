"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS, STEP_GROUPS } from "@/lib/wizard/steps";

interface WizardSidebarProps {
  activeStep: string;
  onStepSelect: (id: string) => void;
  tabLabels: Record<string, string>;
  groupLabels: Record<string, string>;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function WizardSidebar({
  activeStep,
  onStepSelect,
  tabLabels,
  groupLabels,
  collapsed,
  onToggleCollapse,
}: WizardSidebarProps) {
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
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {STEP_GROUPS.map((group, groupIndex) => {
          const groupSteps = group.steps
            .map((id) => WIZARD_STEPS.find((s) => s.id === id)!)
            .filter(Boolean);

          return (
            <div key={group.id}>
              {groupIndex > 0 && (
                <div className={cn("border-t border-border", collapsed ? "my-1.5" : "my-2")} />
              )}

              {!collapsed && (
                <div className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {groupLabels[group.id]}
                </div>
              )}

              {groupSteps.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === activeStep;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onStepSelect(step.id)}
                    title={collapsed ? tabLabels[step.id] : undefined}
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
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Mobile stepper */}
      <nav className="md:hidden flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 px-1">
        {STEP_GROUPS.map((group, groupIndex) => {
          const groupSteps = group.steps
            .map((id) => WIZARD_STEPS.find((s) => s.id === id)!)
            .filter(Boolean);

          return groupSteps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === activeStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepSelect(step.id)}
                className={cn(
                  "flex items-center justify-center shrink-0 w-8 h-8 rounded-full text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                  groupIndex > 0 && step.id === group.steps[0] && "ml-2",
                )}
                title={tabLabels[step.id]}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          });
        })}
      </nav>
    </>
  );
}
