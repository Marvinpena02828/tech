'use client';

import { useRouter, useParams } from 'next/navigation';
// import { useTranslation } from '@/hooks/useTranslation'; // TODO: Hook doesn't exist yet

type Language = 'en' | 'zh' | 'ar';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const params = useParams();
  const currentPath = params?.locale;
  const { locale } = useTranslation();

  const handleLanguageChange = (newLocale: Language) => {
    if (newLocale === locale) return;

    // Get current pathname without locale
    const pathWithoutLocale = (window.location.pathname as string)
      .replace(`/${locale}`, '')
      .replace(/^\//, '');

    // Navigate to new locale path
    router.push(`/${newLocale}/${pathWithoutLocale}`);
  };

  return (
    <div className="language-switcher flex gap-2 items-center">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition ${
            locale === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          aria-label={`Switch to ${lang.label}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
