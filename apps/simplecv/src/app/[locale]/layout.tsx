import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

const LOCALES = ["en", "sv"];

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

async function loadMessages(locale: string) {
  try {
    return (await import(`@/i18n/messages/${locale}.json`)).default;
  } catch {
    return (await import("@/i18n/messages/en.json")).default;
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
