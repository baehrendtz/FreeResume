"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "@/lib/wizard/steps";

interface WizardSidebarProps {
  activeStep: string;
  onStepSelect: (id: string) => void;
  tabLabels: Record<string, string>;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function WizardSidebar({
  activeStep,
  onStepSelect,
  tabLabels,
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

        {WIZARD_STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === activeStep;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepSelect(step.id)}
              title={collapsed ? tabLabels[step.id] : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md text-sm transition-colors text-left",
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
      </nav>

      {/* Mobile stepper */}
      <nav className="md:hidden flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 px-1">
        {WIZARD_STEPS.map((step, index) => {
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
              )}
              title={tabLabels[step.id]}
            >
              {index + 1}
            </button>
          );
        })}
      </nav>
    </>
  );
}
