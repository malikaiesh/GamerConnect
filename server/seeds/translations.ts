import { db } from "@db";
import { languages, translations, siteSettings } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function seedTranslations() {
  try {
    console.log('🌍 Seeding default languages and translations...');

    // Check if languages already exist
    const existingLanguages = await db.select().from(languages).limit(1);
    
    if (existingLanguages.length === 0) {
      // Seed default languages
      const defaultLanguages = [
        {
          code: 'en',
          name: 'English',
          nativeName: 'English',
          flag: '🇺🇸',
          isActive: true,
          sortOrder: 1
        },
        {
          code: 'es',
          name: 'Spanish',
          nativeName: 'Español',
          flag: '🇪🇸',
          isActive: true,
          sortOrder: 2
        },
        {
          code: 'fr',
          name: 'French',
          nativeName: 'Français',
          flag: '🇫🇷',
          isActive: true,
          sortOrder: 3
        },
        {
          code: 'de',
          name: 'German',
          nativeName: 'Deutsch',
          flag: '🇩🇪',
          isActive: true,
          sortOrder: 4
        },
        {
          code: 'it',
          name: 'Italian',
          nativeName: 'Italiano',
          flag: '🇮🇹',
          isActive: true,
          sortOrder: 5
        },
        {
          code: 'pt',
          name: 'Portuguese',
          nativeName: 'Português',
          flag: '🇵🇹',
          isActive: true,
          sortOrder: 6
        },
        {
          code: 'ru',
          name: 'Russian',
          nativeName: 'Русский',
          flag: '🇷🇺',
          isActive: true,
          sortOrder: 7
        },
        {
          code: 'zh',
          name: 'Chinese',
          nativeName: '中文',
          flag: '🇨🇳',
          isActive: true,
          sortOrder: 8
        },
        {
          code: 'ja',
          name: 'Japanese',
          nativeName: '日本語',
          flag: '🇯🇵',
          isActive: true,
          sortOrder: 9
        },
        {
          code: 'ko',
          name: 'Korean',
          nativeName: '한국어',
          flag: '🇰🇷',
          isActive: true,
          sortOrder: 10
        },
        {
          code: 'ar',
          name: 'Arabic',
          nativeName: 'العربية',
          flag: '🇸🇦',
          isActive: true,
          sortOrder: 11
        },
        {
          code: 'hi',
          name: 'Hindi',
          nativeName: 'हिन्दी',
          flag: '🇮🇳',
          isActive: true,
          sortOrder: 12
        }
      ];

      await db.insert(languages).values(defaultLanguages);
      console.log('✅ Default languages seeded successfully');
    } else {
      console.log('ℹ️  Languages already exist, skipping language seeding');
    }

    // Check if basic translations exist
    const existingTranslations = await db.select().from(translations).limit(1);
    
    if (existingTranslations.length === 0) {
      // Seed basic translations for common website elements
      const basicTranslations = [
        // Navigation translations
        { translationKey: 'nav.home', languageCode: 'en', translatedText: 'Home', category: 'navigation' },
        { translationKey: 'nav.home', languageCode: 'es', translatedText: 'Inicio', category: 'navigation' },
        { translationKey: 'nav.home', languageCode: 'fr', translatedText: 'Accueil', category: 'navigation' },
        { translationKey: 'nav.home', languageCode: 'de', translatedText: 'Startseite', category: 'navigation' },
        { translationKey: 'nav.home', languageCode: 'it', translatedText: 'Home', category: 'navigation' },
        { translationKey: 'nav.home', languageCode: 'pt', translatedText: 'Início', category: 'navigation' },
        { translationKey: 'nav.home', languageCode: 'ru', translatedText: 'Главная', category: 'navigation' },
        { translationKey: 'nav.home', languageCode: 'zh', translatedText: '主页', category: 'navigation' },
        { translationKey: 'nav.home', languageCode: 'ja', translatedText: 'ホーム', category: 'navigation' },
        { translationKey: 'nav.home', languageCode: 'ko', translatedText: '홈', category: 'navigation' },
        { translationKey: 'nav.home', languageCode: 'ar', translatedText: 'الرئيسية', category: 'navigation' },
        { translationKey: 'nav.home', languageCode: 'hi', translatedText: 'होम', category: 'navigation' },

        { translationKey: 'nav.games', languageCode: 'en', translatedText: 'Games', category: 'navigation' },
        { translationKey: 'nav.games', languageCode: 'es', translatedText: 'Juegos', category: 'navigation' },
        { translationKey: 'nav.games', languageCode: 'fr', translatedText: 'Jeux', category: 'navigation' },
        { translationKey: 'nav.games', languageCode: 'de', translatedText: 'Spiele', category: 'navigation' },
        { translationKey: 'nav.games', languageCode: 'it', translatedText: 'Giochi', category: 'navigation' },
        { translationKey: 'nav.games', languageCode: 'pt', translatedText: 'Jogos', category: 'navigation' },
        { translationKey: 'nav.games', languageCode: 'ru', translatedText: 'Игры', category: 'navigation' },
        { translationKey: 'nav.games', languageCode: 'zh', translatedText: '游戏', category: 'navigation' },
        { translationKey: 'nav.games', languageCode: 'ja', translatedText: 'ゲーム', category: 'navigation' },
        { translationKey: 'nav.games', languageCode: 'ko', translatedText: '게임', category: 'navigation' },
        { translationKey: 'nav.games', languageCode: 'ar', translatedText: 'الألعاب', category: 'navigation' },
        { translationKey: 'nav.games', languageCode: 'hi', translatedText: 'खेल', category: 'navigation' },

        { translationKey: 'nav.categories', languageCode: 'en', translatedText: 'Categories', category: 'navigation' },
        { translationKey: 'nav.categories', languageCode: 'es', translatedText: 'Categorías', category: 'navigation' },
        { translationKey: 'nav.categories', languageCode: 'fr', translatedText: 'Catégories', category: 'navigation' },
        { translationKey: 'nav.categories', languageCode: 'de', translatedText: 'Kategorien', category: 'navigation' },
        { translationKey: 'nav.categories', languageCode: 'it', translatedText: 'Categorie', category: 'navigation' },
        { translationKey: 'nav.categories', languageCode: 'pt', translatedText: 'Categorias', category: 'navigation' },
        { translationKey: 'nav.categories', languageCode: 'ru', translatedText: 'Категории', category: 'navigation' },
        { translationKey: 'nav.categories', languageCode: 'zh', translatedText: '分类', category: 'navigation' },
        { translationKey: 'nav.categories', languageCode: 'ja', translatedText: 'カテゴリー', category: 'navigation' },
        { translationKey: 'nav.categories', languageCode: 'ko', translatedText: '카테고리', category: 'navigation' },
        { translationKey: 'nav.categories', languageCode: 'ar', translatedText: 'الفئات', category: 'navigation' },
        { translationKey: 'nav.categories', languageCode: 'hi', translatedText: 'श्रेणियाँ', category: 'navigation' },

        // Common UI elements
        { translationKey: 'common.play_now', languageCode: 'en', translatedText: 'Play Now', category: 'common' },
        { translationKey: 'common.play_now', languageCode: 'es', translatedText: 'Jugar Ahora', category: 'common' },
        { translationKey: 'common.play_now', languageCode: 'fr', translatedText: 'Jouer Maintenant', category: 'common' },
        { translationKey: 'common.play_now', languageCode: 'de', translatedText: 'Jetzt Spielen', category: 'common' },
        { translationKey: 'common.play_now', languageCode: 'it', translatedText: 'Gioca Ora', category: 'common' },
        { translationKey: 'common.play_now', languageCode: 'pt', translatedText: 'Jogar Agora', category: 'common' },
        { translationKey: 'common.play_now', languageCode: 'ru', translatedText: 'Играть Сейчас', category: 'common' },
        { translationKey: 'common.play_now', languageCode: 'zh', translatedText: '立即游戏', category: 'common' },
        { translationKey: 'common.play_now', languageCode: 'ja', translatedText: '今すぐプレイ', category: 'common' },
        { translationKey: 'common.play_now', languageCode: 'ko', translatedText: '지금 플레이', category: 'common' },
        { translationKey: 'common.play_now', languageCode: 'ar', translatedText: 'العب الآن', category: 'common' },
        { translationKey: 'common.play_now', languageCode: 'hi', translatedText: 'अब खेलें', category: 'common' },

        { translationKey: 'common.loading', languageCode: 'en', translatedText: 'Loading...', category: 'common' },
        { translationKey: 'common.loading', languageCode: 'es', translatedText: 'Cargando...', category: 'common' },
        { translationKey: 'common.loading', languageCode: 'fr', translatedText: 'Chargement...', category: 'common' },
        { translationKey: 'common.loading', languageCode: 'de', translatedText: 'Laden...', category: 'common' },
        { translationKey: 'common.loading', languageCode: 'it', translatedText: 'Caricamento...', category: 'common' },
        { translationKey: 'common.loading', languageCode: 'pt', translatedText: 'Carregando...', category: 'common' },
        { translationKey: 'common.loading', languageCode: 'ru', translatedText: 'Загрузка...', category: 'common' },
        { translationKey: 'common.loading', languageCode: 'zh', translatedText: '加载中...', category: 'common' },
        { translationKey: 'common.loading', languageCode: 'ja', translatedText: '読み込み中...', category: 'common' },
        { translationKey: 'common.loading', languageCode: 'ko', translatedText: '로딩중...', category: 'common' },
        { translationKey: 'common.loading', languageCode: 'ar', translatedText: 'جاري التحميل...', category: 'common' },
        { translationKey: 'common.loading', languageCode: 'hi', translatedText: 'लोड हो रहा है...', category: 'common' },

        // Language selector
        { translationKey: 'language.select', languageCode: 'en', translatedText: 'Select Language', category: 'language' },
        { translationKey: 'language.select', languageCode: 'es', translatedText: 'Seleccionar Idioma', category: 'language' },
        { translationKey: 'language.select', languageCode: 'fr', translatedText: 'Choisir la Langue', category: 'language' },
        { translationKey: 'language.select', languageCode: 'de', translatedText: 'Sprache Auswählen', category: 'language' },
        { translationKey: 'language.select', languageCode: 'it', translatedText: 'Seleziona Lingua', category: 'language' },
        { translationKey: 'language.select', languageCode: 'pt', translatedText: 'Selecionar Idioma', category: 'language' },
        { translationKey: 'language.select', languageCode: 'ru', translatedText: 'Выбрать Язык', category: 'language' },
        { translationKey: 'language.select', languageCode: 'zh', translatedText: '选择语言', category: 'language' },
        { translationKey: 'language.select', languageCode: 'ja', translatedText: '言語を選択', category: 'language' },
        { translationKey: 'language.select', languageCode: 'ko', translatedText: '언어 선택', category: 'language' },
        { translationKey: 'language.select', languageCode: 'ar', translatedText: 'اختر اللغة', category: 'language' },
        { translationKey: 'language.select', languageCode: 'hi', translatedText: 'भाषा चुनें', category: 'language' },

        // Welcome messages
        { translationKey: 'home.welcome', languageCode: 'en', translatedText: 'Welcome to Gaming Portal', category: 'homepage' },
        { translationKey: 'home.welcome', languageCode: 'es', translatedText: 'Bienvenido a Gaming Portal', category: 'homepage' },
        { translationKey: 'home.welcome', languageCode: 'fr', translatedText: 'Bienvenue sur Gaming Portal', category: 'homepage' },
        { translationKey: 'home.welcome', languageCode: 'de', translatedText: 'Willkommen bei Gaming Portal', category: 'homepage' },
        { translationKey: 'home.welcome', languageCode: 'it', translatedText: 'Benvenuto in Gaming Portal', category: 'homepage' },
        { translationKey: 'home.welcome', languageCode: 'pt', translatedText: 'Bem-vindo ao Gaming Portal', category: 'homepage' },
        { translationKey: 'home.welcome', languageCode: 'ru', translatedText: 'Добро пожаловать в Gaming Portal', category: 'homepage' },
        { translationKey: 'home.welcome', languageCode: 'zh', translatedText: '欢迎来到游戏门户', category: 'homepage' },
        { translationKey: 'home.welcome', languageCode: 'ja', translatedText: 'Gaming Portalへようこそ', category: 'homepage' },
        { translationKey: 'home.welcome', languageCode: 'ko', translatedText: 'Gaming Portal에 오신 것을 환영합니다', category: 'homepage' },
        { translationKey: 'home.welcome', languageCode: 'ar', translatedText: 'مرحباً بك في بوابة الألعاب', category: 'homepage' },
        { translationKey: 'home.welcome', languageCode: 'hi', translatedText: 'गेमिंग पोर्टल में आपका स्वागत है', category: 'homepage' },
      ];

      await db.insert(translations).values(basicTranslations);
      console.log('✅ Basic translations seeded successfully');
    } else {
      console.log('ℹ️  Translations already exist, skipping translation seeding');
    }

    // Update site settings to enable translations by default
    const [existingSiteSettings] = await db.select().from(siteSettings).limit(1);
    
    if (existingSiteSettings) {
      // Check if translation settings are already configured
      if (!existingSiteSettings.translationEnabled) {
        await db.update(siteSettings)
          .set({
            translationEnabled: true,
            defaultLanguage: 'en',
            autoDetectLanguage: true,
            showLanguageSelectorOnHomepage: true,
            updatedAt: new Date()
          })
          .where(eq(siteSettings.id, existingSiteSettings.id));
        
        console.log('✅ Translation settings enabled in site settings');
      } else {
        console.log('ℹ️  Translation settings already configured');
      }
    }

    console.log('🎉 Translation system seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding translations:', error);
    throw error;
  }
}