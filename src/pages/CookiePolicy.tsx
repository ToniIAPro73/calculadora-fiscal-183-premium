import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Cookie, ShieldCheck, SlidersHorizontal, Clock3 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/i18nContext';
import { getCanonicalUrl, getDefaultUrl } from '@/lib/seo';
import {
  COOKIE_CONSENT_MAX_AGE_DAYS,
  COOKIE_CONSENT_UPDATED_EVENT,
  getCookieConsent,
  setCookieConsent,
  clearCookieConsent,
} from '@/lib/cookieConsent';

const contentByLanguage = {
  es: {
    title: 'Política de Cookies · TaxNomad',
    description: 'Política de cookies de TaxNomad con detalle sobre tecnologías técnicas, preferencias locales y consentimiento.',
    updatedAt: 'Última actualización: 27 de abril de 2026',
    heading: 'Política de Cookies',
    intro: 'Información clara sobre las tecnologías de almacenamiento local, cookies técnicas y cualquier futuro uso opcional sujeto a consentimiento.',
    summaryTitle: 'Estado actual',
    summaryBody: 'TaxNomad no utiliza Google Analytics, Google Ads, Google Tag Manager ni cookies publicitarias. Actualmente solo usa tecnologías necesarias para la experiencia básica, las preferencias del usuario y el flujo de pago con Stripe.',
    tableTitle: 'Tecnologías utilizadas',
    tableColumns: ['Elemento', 'Finalidad', 'Tipo', 'Duración', 'Tercero'],
    rows: [
      ['`language` en localStorage', 'Guardar tu preferencia de idioma entre visitas.', 'Técnica / preferencia', 'Hasta que la cambies o limpies tu navegador.', 'No'],
      ['`theme` en localStorage', 'Recordar el modo visual claro u oscuro.', 'Técnica / preferencia', 'Hasta que la cambies o limpies tu navegador.', 'No'],
      ['`taxnomad_cookie_consent` en localStorage', 'Registrar tu elección sobre cookies opcionales.', 'Técnica / cumplimiento', `Hasta ${COOKIE_CONSENT_MAX_AGE_DAYS} días desde tu última elección.`, 'No'],
      ['Mecanismos de Stripe en checkout alojado', 'Seguridad, prevención de fraude y procesamiento del pago cuando accedes al checkout de Stripe.', 'Terceros / técnica', 'Variable según Stripe y el tipo de sesión.', 'Sí, Stripe'],
    ],
    sections: [
      {
        title: '1. ¿Qué son las cookies?',
        body: [
          'Las cookies y tecnologías similares son pequeños archivos o mecanismos de almacenamiento que un sitio web puede utilizar para recordar preferencias, mantener la seguridad o facilitar determinadas funciones.',
          'En TaxNomad también utilizamos almacenamiento local del navegador (`localStorage`) para guardar ajustes necesarios como idioma, tema y estado de consentimiento.',
        ],
      },
      {
        title: '2. Qué utiliza actualmente esta app',
        body: [
          'Cookies técnicas o estrictamente necesarias relacionadas con el funcionamiento básico del servicio y, en su caso, con el checkout de Stripe.',
          'localStorage para idioma, tema y preferencias de consentimiento.',
          'No utilizamos Google Analytics, Google Ads, GTM ni cookies publicitarias.',
        ],
      },
      {
        title: '3. Base legal',
        body: [
          'Las tecnologías técnicas o estrictamente necesarias se utilizan por interés legítimo y necesidad técnica para prestar el servicio solicitado.',
          'Las tecnologías no esenciales solo se activarán con consentimiento explícito si se incorporan en el futuro.',
        ],
      },
      {
        title: '4. Gestión del consentimiento',
        body: [
          'Puedes aceptar o rechazar las cookies opcionales desde el banner mostrado en la web.',
          'Aunque hoy no se cargan servicios opcionales, tu elección queda registrada localmente para futuras funciones si llegaran a existir.',
          'Puedes retirar el consentimiento o reiniciar tu elección en cualquier momento desde esta página o desde el footer.',
        ],
      },
      {
        title: '5. Cambios en esta política',
        body: [
          'Podremos actualizar esta Política de Cookies para reflejar cambios legales, técnicos o de producto.',
          'Cuando ocurra, publicaremos la nueva versión con su fecha de actualización correspondiente.',
        ],
      },
    ],
    consentTitle: 'Gestionar tu elección',
    consentAccepted: 'Actualmente has aceptado las cookies opcionales.',
    consentRejected: 'Actualmente has rechazado las cookies opcionales.',
    consentMissing: 'Todavía no has elegido una preferencia de cookies opcionales.',
    accept: 'Aceptar',
    reject: 'Rechazar',
    reset: 'Reabrir preferencias',
    providerNote: 'Para más información sobre tecnologías de terceros relacionadas con pagos, consulta la documentación y política de privacidad de Stripe.',
  },
  en: {
    title: 'Cookie Policy · TaxNomad',
    description: 'TaxNomad cookie policy describing technical storage, local preferences, and consent handling.',
    updatedAt: 'Last updated: April 27, 2026',
    heading: 'Cookie Policy',
    intro: 'Clear information about local storage technologies, technical cookies, and any future optional usage subject to consent.',
    summaryTitle: 'Current status',
    summaryBody: 'TaxNomad does not use Google Analytics, Google Ads, Google Tag Manager, or advertising cookies. At the moment, it only relies on technologies necessary for the core experience, user preferences, and Stripe payment flow.',
    tableTitle: 'Technologies in use',
    tableColumns: ['Item', 'Purpose', 'Type', 'Duration', 'Third party'],
    rows: [
      ['`language` in localStorage', 'Stores your language preference between visits.', 'Technical / preference', 'Until you change it or clear your browser.', 'No'],
      ['`theme` in localStorage', 'Remembers your light or dark visual mode.', 'Technical / preference', 'Until you change it or clear your browser.', 'No'],
      ['`taxnomad_cookie_consent` in localStorage', 'Records your choice for optional cookies.', 'Technical / compliance', `Up to ${COOKIE_CONSENT_MAX_AGE_DAYS} days from your latest choice.`, 'No'],
      ['Stripe-owned mechanisms on hosted checkout', 'Security, fraud prevention, and payment processing when you open Stripe Checkout.', 'Third-party / technical', 'Varies according to Stripe and session type.', 'Yes, Stripe'],
    ],
    sections: [
      {
        title: '1. What are cookies?',
        body: [
          'Cookies and similar technologies are small files or storage mechanisms that a website may use to remember preferences, maintain security, or support certain functions.',
          'At TaxNomad we also use browser local storage (`localStorage`) to keep necessary settings such as language, theme, and consent status.',
        ],
      },
      {
        title: '2. What this app currently uses',
        body: [
          'Technical or strictly necessary technologies related to the basic operation of the service and, where applicable, Stripe hosted checkout.',
          'localStorage for language, theme, and consent preferences.',
          'We do not use Google Analytics, Google Ads, GTM, or advertising cookies.',
        ],
      },
      {
        title: '3. Legal basis',
        body: [
          'Technical or strictly necessary technologies are used on the basis of legitimate interest and technical necessity to provide the requested service.',
          'Non-essential technologies will only be enabled with explicit consent if they are added in the future.',
        ],
      },
      {
        title: '4. Managing consent',
        body: [
          'You can accept or reject optional cookies from the banner shown on the website.',
          'Even though no optional services are currently loaded, your choice is stored locally for future optional features if they are ever introduced.',
          'You can withdraw consent or reset your choice at any time from this page or from the footer.',
        ],
      },
      {
        title: '5. Changes to this policy',
        body: [
          'We may update this Cookie Policy to reflect legal, technical, or product changes.',
          'When that happens, we will publish the new version together with its updated revision date.',
        ],
      },
    ],
    consentTitle: 'Manage your choice',
    consentAccepted: 'You have currently accepted optional cookies.',
    consentRejected: 'You have currently rejected optional cookies.',
    consentMissing: 'You have not selected an optional cookie preference yet.',
    accept: 'Accept',
    reject: 'Reject',
    reset: 'Reset preferences',
    providerNote: 'For more information about third-party payment-related technologies, please review Stripe’s documentation and privacy policy.',
  },
};

const CookiePolicy: React.FC = () => {
  const { language } = useLanguage();
  const content = contentByLanguage[language as 'es' | 'en'] || contentByLanguage.en;
  const [consentStatus, setConsentStatus] = useState(() => getCookieConsent()?.status ?? null);

  useEffect(() => {
    const syncConsentState = () => {
      setConsentStatus(getCookieConsent()?.status ?? null);
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, syncConsentState);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, syncConsentState);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>{content.title}</title>
        <meta name="description" content={content.description} />
        <link rel="canonical" href={getCanonicalUrl(language, '/cookies')} />
        <link rel="alternate" hrefLang="es" href={getCanonicalUrl('es', '/cookies')} />
        <link rel="alternate" hrefLang="en" href={getCanonicalUrl('en', '/cookies')} />
        <link rel="alternate" hrefLang="x-default" href={`${getDefaultUrl()}cookies/`} />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
          <div className="mb-12 border-b border-border pb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{content.updatedAt}</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              {content.heading.split(' ')[0]} <span className="text-primary">{content.heading.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">{content.intro}</p>
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-8">
              <section className="p-6 rounded-2xl border border-primary/10 bg-primary/5 sm:p-8">
                <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold">
                  <ShieldCheck className="w-6 h-6 text-primary" /> {content.summaryTitle}
                </h2>
                <p className="leading-7 text-foreground/80">{content.summaryBody}</p>
              </section>

              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold">
                  <SlidersHorizontal className="w-6 h-6 text-primary" /> {content.consentTitle}
                </h2>
                <p className="mb-5 text-sm leading-6 text-muted-foreground">
                  {consentStatus === 'accepted'
                    ? content.consentAccepted
                    : consentStatus === 'rejected'
                    ? content.consentRejected
                    : content.consentMissing}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button type="button" className="h-11 rounded-full px-5" onClick={() => setCookieConsent('accepted')}>
                    {content.accept}
                  </Button>
                  <Button type="button" variant="outline" className="h-11 rounded-full px-5" onClick={() => setCookieConsent('rejected')}>
                    {content.reject}
                  </Button>
                  <Button type="button" variant="ghost" className="h-11 rounded-full px-5" onClick={clearCookieConsent}>
                    {content.reset}
                  </Button>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="mb-5 flex items-center gap-3 text-2xl font-bold">
                <Cookie className="w-6 h-6 text-primary" /> {content.tableTitle}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="grid grid-cols-1 md:grid-cols-5 bg-muted/35">
                  {content.tableColumns.map((column) => (
                    <div key={column} className="border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground md:border-b-0 md:border-r last:border-r-0">
                      {column}
                    </div>
                  ))}
                </div>
                {content.rows.map((row) => (
                  <div key={row[0]} className="grid grid-cols-1 md:grid-cols-5">
                    {row.map((cell, cellIndex) => (
                      <div key={`${row[0]}-${cellIndex}`} className="border-b border-border px-4 py-4 text-sm leading-6 text-foreground/80 md:border-r last:border-r-0 last:border-b-0">
                        {cell}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{content.providerNote}</p>
            </section>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {content.sections.map((section, index) => (
              <section key={section.title} className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold">
                  {index % 2 === 0 ? <Clock3 className="w-6 h-6 text-primary" /> : <ShieldCheck className="w-6 h-6 text-primary" />}
                  {section.title}
                </h2>
                {section.body.map((paragraph) => <p key={paragraph} className="mt-3 leading-relaxed text-foreground/80 first:mt-0">{paragraph}</p>)}
              </section>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CookiePolicy;
