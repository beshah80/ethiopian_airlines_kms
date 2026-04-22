"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "dashboard": "Aviation Command",
        "knowledge": "Knowledge Base",
        "experts": "Expert Locator",
        "lessons": "Lessons Learned",
        "innovation": "Innovation Hub",
        "directory": "User Directory"
      },
      "dashboard": {
        "welcome": "Welcome back",
        "search_placeholder": "Search for SOPs, experts, or ideas...",
        "stats": {
          "articles": "Knowledge Articles",
          "experts": "Active Experts",
          "ideas": "Pending Ideas"
        }
      },
      "actions": {
        "share": "Share Knowledge",
        "submit": "Submit Idea",
        "report": "Report Lesson",
        "add_user": "Add User"
      }
    }
  },
  am: {
    translation: {
      "nav": {
        "dashboard": "የአቪዬሽን ትእዛዝ",
        "knowledge": "የዕውቀት ማዕከል",
        "experts": "ባለሙያዎችን መፈለጊያ",
        "lessons": "የተቀሰሙ ትምህርቶች",
        "innovation": "የፈጠራ ማዕከል",
        "directory": "የተጠቃሚዎች ዝርዝር"
      },
      "dashboard": {
        "welcome": "እንኳን ደህና መጡ",
        "search_placeholder": "መመሪያዎችን፣ ባለሙያዎችን ወይም ሃሳቦችን ይፈልጉ...",
        "stats": {
          "articles": "የዕውቀት ጽሁፎች",
          "experts": "ንቁ ባለሙያዎች",
          "ideas": "በጥበቃ ላይ ያሉ ሃሳቦች"
        }
      },
      "actions": {
        "share": "ዕውቀት ያጋሩ",
        "submit": "ሃሳብ ያቅርቡ",
        "report": "ትምህርት ይመዝግቡ",
        "add_user": "ተጠቃሚ ይጨምሩ"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
