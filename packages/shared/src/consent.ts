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

export function setConsent(
  value: ConsentValue,
  domain: string = DEFAULT_DOMAIN,
) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${value}; Domain=${domain}; Path=/; SameSite=Lax; Max-Age=${ONE_YEAR}`;
}

export function clearConsent(domain: string = DEFAULT_DOMAIN) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; Domain=${domain}; Path=/; SameSite=Lax; Max-Age=0`;
}

let gaLoaded = false;

export function loadGoogleAnalytics(
  measurementId: string,
  linkerDomains: readonly string[],
) {
  if (typeof window === "undefined" || gaLoaded) return;
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`))
    return;
  gaLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId, {
    linker: { domains: [...linkerDomains] },
  });
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
