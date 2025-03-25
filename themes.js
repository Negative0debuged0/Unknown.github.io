// Color management for the website
import config from './config.js';

// Apply base theme with custom accent
export function applyTheme() {
    const theme = config.baseTheme;
    
    // Update CSS variables with theme colors
    document.documentElement.style.setProperty('--main-bg-color', theme.mainBg);
    document.documentElement.style.setProperty('--card-bg-color', theme.cardBg);
    document.documentElement.style.setProperty('--text-color', theme.textColor);
    
    // Set accent color (custom or default)
    const accentColor = config.options.useCustomAccentColor ? config.options.customAccentColor : theme.accentColor;
    document.documentElement.style.setProperty('--accent-color', accentColor);
    
    document.documentElement.style.setProperty('--header-bg-color', theme.headerBg);
    document.documentElement.style.setProperty('--card-hover-color', theme.cardHover);
    document.documentElement.style.setProperty('--card-border-color', theme.cardBorder);
    document.documentElement.style.setProperty('--glitch-color1', theme.glitchColor1);
    document.documentElement.style.setProperty('--glitch-color2', theme.glitchColor2);
    
    // Update config accent color
    config.accentColor = accentColor;
}

// Save options to localStorage
export function saveOptions() {
    localStorage.setItem('zero-website-options', JSON.stringify(config.options));
}

// Load options from localStorage
export function loadOptions() {
    const savedOptions = localStorage.getItem('zero-website-options');
    if (savedOptions) {
        try {
            const parsedOptions = JSON.parse(savedOptions);
            // Update config with saved options
            Object.assign(config.options, parsedOptions);
            
            // Apply theme with loaded options
            applyTheme();
        } catch (error) {
            console.error('Error loading saved options', error);
        }
    }
}

// Call loadOptions on module initialization
loadOptions();