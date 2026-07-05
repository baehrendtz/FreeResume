const COOKIE_NAME = "cookie-consent";
const DEFAULT_DOMAIN = ".freeresume.eu";
const ONE_YEAR = 31536000;

export type ConsentValue = "accepted" | "declined";

export function getConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.split("=")[1];
  return value === "accepted" || value === "declined" ? value : null;
}

export function setConsent(value: ConsentValue, domain?: string) {
  if (typeof document === "undefined") return;
  const effectiveDomain = domain ?? (
    typeof location !== "undefined" && location.hostname.endsWith("freeresume.eu")
      ? DEFAULT_DOMAIN
      : undefined
  );
  const domainPart = effectiveDomain ? `; Domain=${effectiveDomain}` : "";
  document.cookie = `${COOKIE_NAME}=${value}${domainPart}; Path=/; SameSite=Lax; Max-Age=${ONE_YEAR}`;
}

export function clearConsent(domain?: string) {
  if (typeof document === "undefined") return;
  const effectiveDomain = domain ?? (
    typeof location !== "undefined" && location.hostname.endsWith("freeresume.eu")
      ? DEFAULT_DOMAIN
      : undefined
  );
  const domainPart = effectiveDomain ? `; Domain=${effectiveDomain}` : "";
  document.cookie = `${COOKIE_NAME}=${domainPart}; Path=/; SameSite=Lax; Max-Age=0`;
}

let gaInitialized = false;

// Consent Mode v2: gtag.js laddas alltid, men med allt samtycke nekat som
// standard. Innan användaren accepterat skickas endast cookielösa pings.
export function initGoogleAnalytics(
  measurementId: string,
  linkerDomains: readonly string[],
) {
  if (typeof window === "undefined" || gaInitialized) return;
  gaInitialized = true;

  window.dataLayer = window.dataLayer || [];
  function gtag(..._args: unknown[]) {
    // gtag.js ignorerar vanliga arrayer, kommandon måste pushas som arguments-objektet
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  }
  window.gtag = gtag;

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });

  gtag("js", new Date());
  gtag("config", measurementId, {
    linker: { domains: [...linkerDomains] },
  });

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }
}

export function grantAnalyticsConsent() {
  if (typeof window === "undefined") return;
  window.gtag?.("consent", "update", { analytics_storage: "granted" });
}

export function denyAnalyticsConsent() {
  if (typeof window === "undefined") return;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  removeGoogleAnalyticsCookies();
}

export function removeGoogleAnalyticsCookies() {
  if (typeof document === "undefined") return;
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const name = cookie.split("=")[0];
    if (name.startsWith("_ga")) {
      // Clear on all possible domain variations
      for (const domain of ["", ".freeresume.eu", "freeresume.eu"]) {
        const domainPart = domain ? `; Domain=${domain}` : "";
        document.cookie = `${name}=; Path=/${domainPart}; Max-Age=0`;
      }
    }
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
