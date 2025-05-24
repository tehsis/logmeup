import type { Theme } from '../contexts/ThemeContext';

export const getThemeClasses = (isDark: boolean) => ({
  // Background classes
  bg: {
    primary: isDark ? 'bg-gray-900' : 'bg-white',
    secondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
    card: isDark ? 'bg-black' : 'bg-white',
    input: isDark ? 'bg-gray-800' : 'bg-white',
    button: isDark ? 'bg-blue-500' : 'bg-blue-600',
    buttonHover: isDark ? 'hover:bg-blue-600' : 'hover:bg-blue-700',
    success: isDark ? 'bg-green-500' : 'bg-green-600',
    successHover: isDark ? 'hover:bg-green-600' : 'hover:bg-green-700',
    danger: isDark ? 'bg-red-500' : 'bg-red-600',
    dangerHover: isDark ? 'hover:bg-red-600' : 'hover:bg-red-700',
    warning: isDark ? 'bg-orange-500' : 'bg-orange-600',
  },
  
  // Text classes
  text: {
    primary: isDark ? 'text-white' : 'text-gray-900',
    secondary: isDark ? 'text-gray-300' : 'text-gray-600',
    muted: isDark ? 'text-gray-400' : 'text-gray-500',
    accent: isDark ? 'text-blue-400' : 'text-blue-600',
    success: isDark ? 'text-green-400' : 'text-green-600',
    danger: isDark ? 'text-red-400' : 'text-red-600',
    warning: isDark ? 'text-orange-400' : 'text-orange-600',
  },
  
  // Border classes
  border: {
    primary: isDark ? 'border-gray-600' : 'border-gray-300',
    secondary: isDark ? 'border-gray-700' : 'border-gray-200',
    accent: isDark ? 'border-blue-500' : 'border-blue-300',
    input: isDark ? 'border-gray-600' : 'border-gray-300',
    focus: isDark ? 'focus:border-blue-500' : 'focus:border-blue-500',
  },
  
  // Status indicator classes
  status: {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    pending: isDark ? 'text-orange-400' : 'text-orange-600',
    syncing: isDark ? 'text-blue-400' : 'text-blue-600',
  },
});

export const getActionItemClasses = (isDark: boolean, completed: boolean) => {
  const base = isDark 
    ? 'bg-black border-white text-white' 
    : 'bg-white border-gray-300 text-gray-900';
    
  const completedOverride = completed 
    ? (isDark ? 'text-gray-400' : 'text-gray-500')
    : '';
    
  return `${base} ${completedOverride}`;
};

export const getSuggestionItemClasses = (isDark: boolean) => 
  isDark 
    ? 'border-gray-600 hover:bg-gray-700 hover:text-white' 
    : 'border-gray-300 hover:bg-gray-50 hover:text-gray-900';

export const getInputClasses = (isDark: boolean) => 
  isDark
    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500';

export const getTabClasses = (isDark: boolean, isActive: boolean) => {
  const base = isActive 
    ? 'text-blue-600 border-b-2 border-blue-600'
    : (isDark ? 'text-gray-400' : 'text-gray-500');
    
  return `flex-1 py-3 px-4 text-center font-medium ${base}`;
}; 