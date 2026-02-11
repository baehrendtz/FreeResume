"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { BRAND } from "@freeresume/shared/brand";
import {
  getConsent,
  setConsent,
  loadGoogleAnalytics,
  removeGoogleAnalyticsCookies,
} from "@freeresume/shared/consent";

export function CookieConsent() {
  const t = useTranslations("consent");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return getConsent() === null;
  });

  useEffect(() => {
    if (!mounted) return;
    const consent = getConsent();
    if (consent === "accepted") {
      loadGoogleAnalytics(BRAND.ga.measurementId, BRAND.ga.linkerDomains);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () => setVisible(true);
    window.addEventListener("show-cookie-consent", handler);
    return () => window.removeEventListener("show-cookie-consent", handler);
  }, [mounted]);

  const handleAccept = () => {
    setConsent("accepted");
    loadGoogleAnalytics(BRAND.ga.measurementId, BRAND.ga.linkerDomains);
    setVisible(false);
  };

  const handleDecline = () => {
    setConsent("declined");
    removeGoogleAnalyticsCookies();
    delete window.gtag;
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div className="print:hidden fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="mx-auto max-w-lg rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg p-4 flex flex-col sm:flex-row items-center gap-3">
        <p className="text-sm text-muted-foreground flex-1">
          {t("message")}
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            {t("decline")}
          </Button>
          <Button size="sm" onClick={handleAccept}>
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
