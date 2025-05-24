# Light/Dark Theme System

This application now includes a comprehensive light/dark theme system that provides a seamless user experience across different lighting conditions and user preferences.

## Features

### ✅ **Automatic Theme Detection**
- **System Preference**: Detects user's system color scheme preference
- **Local Storage**: Remembers user's manual theme selection
- **Fallback**: Defaults to dark theme if no preference is found

### ✅ **Manual Theme Toggle**
- **Theme Button**: Sun/Moon icon button in the Action component header
- **Instant Switch**: Immediate visual feedback when toggling themes
- **Persistent**: Choice is saved to localStorage for future sessions

### ✅ **Comprehensive Component Support**
- **Action Component**: Full theme support with status indicators
- **Notes Component**: Themed text areas, selects, and content
- **Main Layout**: Themed tabs, borders, and background colors
- **Status Indicators**: Online/offline, sync status, pending counts

### ✅ **Accessibility Features**
- **Focus Rings**: Theme-aware focus indicators
- **Selection Colors**: Proper text selection colors for each theme
- **Scrollbars**: Custom styled scrollbars that match the theme
- **Color Contrast**: High contrast ratios for better readability

## Implementation

### Theme Context
```typescript
// Theme Provider wraps the entire app
<ThemeProvider>
  <App />
</ThemeProvider>

// Use theme in components
const { theme, isDark, toggleTheme } = useTheme();
```

### Theme Utilities
```typescript
// Get comprehensive theme classes
const theme = getThemeClasses(isDark);

// Use specific utility functions
const actionClasses = getActionItemClasses(isDark, completed);
const inputClasses = getInputClasses(isDark);
const tabClasses = getTabClasses(isDark, isActive);
```

### Component Integration
```typescript
// Theme-aware styling
<div className={`${theme.bg.primary} ${theme.text.primary}`}>
  <button className={`${theme.bg.button} ${theme.bg.buttonHover}`}>
    Click me
  </button>
</div>
```

## Color Palette

### Light Theme
- **Primary Background**: White (`bg-white`)
- **Secondary Background**: Gray 50 (`bg-gray-50`)
- **Card Background**: White (`bg-white`)
- **Primary Text**: Gray 900 (`text-gray-900`)
- **Secondary Text**: Gray 600 (`text-gray-600`)
- **Borders**: Gray 300 (`border-gray-300`)

### Dark Theme
- **Primary Background**: Gray 900 (`bg-gray-900`)
- **Secondary Background**: Gray 800 (`bg-gray-800`)
- **Card Background**: Black (`bg-black`)
- **Primary Text**: White (`text-white`)
- **Secondary Text**: Gray 300 (`text-gray-300`)
- **Borders**: Gray 600 (`border-gray-600`)

### Status Colors (Theme Agnostic)
- **Online**: Green 500 (`bg-green-500`)
- **Offline**: Red 500 (`bg-red-500`)
- **Success**: Green variants
- **Warning**: Orange variants
- **Error**: Red variants

## Usage Examples

### Basic Component Theming
```typescript
import { useTheme } from "../contexts/ThemeContext";
import { getThemeClasses } from "../utils/theme";

function MyComponent() {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  
  return (
    <div className={`p-4 ${theme.bg.primary}`}>
      <h1 className={theme.text.primary}>Hello World</h1>
      <button className={`${theme.bg.button} ${theme.bg.buttonHover}`}>
        Click me
      </button>
    </div>
  );
}
```

### Theme Toggle Button
```typescript
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
```

### Conditional Styling
```typescript
function ConditionalComponent({ isActive }) {
  const { isDark } = useTheme();
  
  return (
    <div className={
      isActive 
        ? isDark ? 'bg-blue-800' : 'bg-blue-100'
        : isDark ? 'bg-gray-800' : 'bg-gray-100'
    }>
      Content
    </div>
  );
}
```

## Files Modified

### Core Theme System
- `app/contexts/ThemeContext.tsx` - Theme context provider
- `app/utils/theme.ts` - Theme utility functions
- `app/app.css` - Global theme styles

### Updated Components
- `app/components/Action.tsx` - Full theme integration
- `app/components/Notes.tsx` - Theme-aware styling
- `app/routes/_index.tsx` - Theme provider wrapper

## Customization

### Adding New Theme Colors
```typescript
// In utils/theme.ts
export const getThemeClasses = (isDark: boolean) => ({
  // Add new color categories
  bg: {
    // existing colors...
    custom: isDark ? 'bg-purple-800' : 'bg-purple-100',
  },
  text: {
    // existing colors...
    custom: isDark ? 'text-purple-200' : 'text-purple-800',
  }
});
```

### Creating Theme-Aware Components
```typescript
function NewComponent() {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  
  return (
    <div className={`component-base ${theme.bg.primary} ${theme.text.primary}`}>
      {/* Component content */}
    </div>
  );
}
```

## Browser Support

- **Modern Browsers**: Full support for all theme features
- **CSS Custom Properties**: Used for advanced theming
- **localStorage**: For theme persistence
- **matchMedia**: For system preference detection

## Performance

- **Zero Runtime Cost**: Themes are computed once and cached
- **Minimal Bundle Size**: Only loads theme utilities when used
- **Fast Switching**: Instant theme changes with no flicker
- **Efficient Storage**: Minimal localStorage usage

## Accessibility

- **WCAG Compliant**: High contrast ratios in both themes
- **System Integration**: Respects user's system preferences
- **Keyboard Navigation**: Proper focus indicators
- **Screen Readers**: Semantic markup preserved

## Future Enhancements

- **Custom Color Schemes**: User-defined color palettes
- **Theme Scheduling**: Automatic dark mode at sunset
- **High Contrast Mode**: Enhanced accessibility option
- **Theme Presets**: Predefined color combinations
- **CSS Variables**: Runtime theme customization 