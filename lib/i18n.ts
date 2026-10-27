/* ────────────────────────────────────────────────────────────
   Lightweight i18n for SproutBox (no new dependency).
   Languages: en (source), kn (Kannada), hi (Hindi).
   ────────────────────────────────────────────────────────────

   NOTE(review): every kn/hi string below was translated by the
   coding agent, not a native speaker, and carries a
   // TODO(review): native speaker marker. Do not ship kn/hi
   variant copy to production until a native speaker reviews it.
   ──────────────────────────────────────────────────────────── */

export type Lang = "en" | "kn" | "hi";

export const DEFAULT_LANG: Lang = "en";

export const SUPPORTED_LANGS: Lang[] = ["en", "kn", "hi"];

export const messages: Record<Lang, Record<string, string>> = {
  en: {
    // Hero
    hero_control_1: "Farm‑Fresh Microgreens.",
    hero_control_2: "Delivered to Your Kitchen.",
    hero_headline_b:
      "Fresh microgreens for your kitchen. Steady income for local growers.",
    hero_subhead:
      "SproutBox connects your restaurant to a network of local growers. Place demand, and we grow it fresh — harvested and delivered within days.",
    hero_cta_order: "Place Your First Order",
    hero_cta_how: "See How It Works",

    // Navbar / footer
    nav_home: "Home",
    nav_features: "Features",
    nav_benefits: "Benefits",
    nav_how_it_works: "How It Works",
    footer_get_started: "Get Started",
  },
  kn: {
    // TODO(review): native speaker — agent-translated Kannada
    hero_control_1: "ಹಳ್ಳಿಯ ತಾಜಾ ಮೈಕ್ರೋಗ್ರೀನ್‌ಗಳು.",
    // TODO(review): native speaker — agent-translated Kannada
    hero_control_2: "ನಿಮ್ಮ ಅಡುಗೆಮನೆಗೆ ತಲುಪಾಗಿದೆ.",
    // TODO(review): native speaker — agent-translated Kannada
    hero_headline_b:
      "ನಿಮ್ಮ ಅಡುಗೆಗಾಗಿ ತಾಜಾ ಮೈಕ್ರೋಗ್ರೀನ್‌ಗಳು. ಸ್ಥಳೀಯ ಬೆಳೆಗಾರರಿಗೆ ಸ್ಥಿರ ಆದಾಯ.",
    // TODO(review): native speaker — agent-translated Kannada
    hero_subhead:
      "SproutBox ನಿಮ್ಮ ರೆಸ್ಟೋರೆಂಟ್ ಅನ್ನು sthaleeya belagarara network-ge connect maduttade. Nimma order irisidare, naavu taja belayuttidve — ondu dinalige koylu haki delivery maduttidve.",
    // TODO(review): native speaker — agent-translated Kannada
    hero_cta_order: "Nimma modala order place madi",
    // TODO(review): native speaker — agent-translated Kannada
    hero_cta_how: "Idenu estamadi nodi",
    // TODO(review): native speaker — agent-translated Kannada
    nav_home: "Mukhya prushtha",
    // TODO(review): native speaker — agent-translated Kannada
    nav_features: "Vaisishtyagalu",
    // TODO(review): native speaker — agent-translated Kannada
    nav_benefits: "Labhagalu",
    // TODO(review): native speaker — agent-translated Kannada
    nav_how_it_works: "Hege kelasa madutte nodi",
    // TODO(review): native speaker — agent-translated Kannada
    footer_get_started: "Arambhisi",
  },
  hi: {
    // TODO(review): native speaker — agent-translated Hindi
    hero_control_1: "खेत से ताज़ा माइक्रोग्रीन्स.",
    // TODO(review): native speaker — agent-translated Hindi
    hero_control_2: "आपकी रसोई तक पहुंचाया गया.",
    // TODO(review): native speaker — agent-translated Hindi
    hero_headline_b:
      "आपकी रसोई के लिए ताज़ा माइक्रोग्रीन्स. स्थानीय उगाने वालों के लिए स्थिर आय.",
    // TODO(review): native speaker — agent-translated Hindi
    hero_subhead:
      "SproutBox आपके रेस्टोरेंट को स्थानीय उगाने वालों के नेटवर्क से जोड़ता है. मांग रखें, हम ताज़ा उगाते हैं — दिन के अंदर काटकर डिलीवर.",
    // TODO(review): native speaker — agent-translated Hindi
    hero_cta_order: "अपना पहला ऑर्डर दें",
    // TODO(review): native speaker — agent-translated Hindi
    hero_cta_how: "कैसे काम करता है देखें",
    // TODO(review): native speaker — agent-translated Hindi
    nav_home: "होम",
    // TODO(review): native speaker — agent-translated Hindi
    nav_features: "विशेषताएं",
    // TODO(review): native speaker — agent-translated Hindi
    nav_benefits: "लाभ",
    // TODO(review): native speaker — agent-translated Hindi
    nav_how_it_works: "कैसे काम करता है",
    // TODO(review): native speaker — agent-translated Hindi
    footer_get_started: "शुरू करें",
  },
};

export function t(lang: Lang, key: string): string {
  return messages[lang]?.[key] ?? messages[DEFAULT_LANG][key] ?? key;
}

export function useTranslations(lang: Lang = DEFAULT_LANG) {
  return (key: string) => t(lang, key);
}
