import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en/common.json";
import ta from "@/locales/ta/common.json";
import hi from "@/locales/hi/common.json";

// Multi-language UI is on hold for now — translation files stay in the codebase
// (en/ta/hi already built) so re-enabling later is just re-adding the language
// switcher and LanguageDetector; no restructuring needed.
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      ta: { common: ta },
      hi: { common: hi },
    },
    lng: "en",
    fallbackLng: "en",
    defaultNS: "common",
    interpolation: { escapeValue: false },
  });

export default i18n;
