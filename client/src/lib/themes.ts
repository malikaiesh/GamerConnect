export interface Theme {
  id: string;
  name: string;
  class: string;
  description: string;
}

export const themes: Theme[] = [
  {
    id: 'modern',
    name: 'Modern',
    class: '',
    description: 'A clean, modern design with purple and orange accents'
  },
  {
    id: 'sports',
    name: 'Sports',
    class: 'sports-theme',
    description: 'Energetic blue and orange theme for sports games'
  },
  {
    id: 'girls',
    name: 'Girls',
    class: 'girls-theme',
    description: 'Pink and purple theme with a playful touch'
  },
  {
    id: 'retro',
    name: 'Retro',
    class: 'retro-theme',
    description: 'A nostalgic theme with bright, bold colors'
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    class: 'futuristic-theme',
    description: 'Sleek blue and purple theme with a tech vibe'
  },
  {
    id: 'lunexa',
    name: 'Lunexa',
    class: 'lunexa-theme',
    description: 'Premium dark theme with deep purple/blue background and vibrant accent colors'
  }
];

// Function to set theme
export function setTheme(themeId: string) {
  // Remove existing theme classes
  document.documentElement.classList.remove(
    ...themes.map(theme => theme.class).filter(Boolean)
  );
  
  // Add new theme class
  const theme = themes.find(t => t.id === themeId);
  if (theme && theme.class) {
    document.documentElement.classList.add(theme.class);
  }
  
  // For debugging
  console.log(`Theme changed to: ${themeId}, applied class: ${theme?.class || 'none'}`);
  
  // Save to localStorage
  localStorage.setItem('theme', themeId);
}

// Function to get current theme
export function getCurrentTheme(): string {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme || 'modern';
}

// Function to toggle dark mode
export function toggleDarkMode(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('darkMode', isDark ? 'dark' : 'light');
}

// Function to get current dark mode setting
export function isDarkMode(): boolean {
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode) {
    return savedMode === 'dark';
  }
  // Default to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
