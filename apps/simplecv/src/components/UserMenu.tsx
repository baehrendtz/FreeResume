"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut } from "lucide-react";

export function UserMenu() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const t = useTranslations("auth");

  if (loading) return null;

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="hidden md:inline-flex"
        onClick={signInWithGoogle}
      >
        <LogIn className="h-4 w-4 mr-1" />
        {t("signIn")}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex h-8 w-8 rounded-full p-0 overflow-hidden"
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {user.displayName?.[0] ?? user.email?.[0] ?? "?"}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            {user.displayName && (
              <span className="text-sm font-medium">{user.displayName}</span>
            )}
            {user.email && (
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="h-4 w-4" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Compact version for use inside a mobile dropdown menu */
export function UserMenuMobile() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const t = useTranslations("auth");

  if (loading) return null;

  if (!user) {
    return (
      <DropdownMenuItem onClick={signInWithGoogle}>
        <LogIn className="h-4 w-4" />
        {t("signIn")}
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem onClick={signOut}>
      <LogOut className="h-4 w-4" />
      {t("signOut")}
    </DropdownMenuItem>
  );
}
