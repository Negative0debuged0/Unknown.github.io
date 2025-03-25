// Color picker functionality
import config from './config.js';
import { saveOptions, applyTheme } from './themes.js';

// Initialize color picker in the options menu
export function initColorPicker() {
    // Create color picker elements if they don't exist
    const createColorPickerUI = () => {
        const colorPickerSection = document.querySelector('.color-picker-section');
        if (colorPickerSection) return;

        // Create color picker section
        const section = document.createElement('div');
        section.className = 'option-section color-picker-section';
        
        section.innerHTML = `
            <h4>Custom Colors</h4>
            <div class="option-item">
                <span class="option-title">Accent Color</span>
                <div class="color-picker-container">
                    <input type="color" id="accent-color-picker" value="${config.options.customAccentColor || config.baseTheme.accentColor}">
                    <input type="text" id="accent-color-hex" value="${config.options.customAccentColor || config.baseTheme.accentColor}" placeholder="#FFFFFF">
                </div>
            </div>
            <div class="option-item">
                <span class="option-title">Use Custom Color</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="toggle-custom-color" ${config.options.useCustomAccentColor ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
        `;
        
        // Insert at beginning of options list
        const optionsList = document.querySelector('.options-list');
        if (optionsList.firstChild) {
            optionsList.insertBefore(section, optionsList.firstChild);
        } else {
            optionsList.appendChild(section);
        }
        
        // Add event listeners
        const colorPicker = document.getElementById('accent-color-picker');
        const hexInput = document.getElementById('accent-color-hex');
        const toggleCustomColor = document.getElementById('toggle-custom-color');
        
        // Sync color picker and hex input
        colorPicker.addEventListener('input', (e) => {
            hexInput.value = e.target.value;
            if (config.options.useCustomAccentColor) {
                updateAccentColor(e.target.value);
            }
        });
        
        // Update from hex input
        hexInput.addEventListener('input', (e) => {
            let hex = e.target.value;
            // Add # if missing
            if (hex.charAt(0) !== '#') {
                hex = '#' + hex;
            }
            
            // Validate hex code
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                colorPicker.value = hex;
                if (config.options.useCustomAccentColor) {
                    updateAccentColor(hex);
                }
            }
        });
        
        // Toggle custom color
        toggleCustomColor.addEventListener('change', (e) => {
            const useCustom = e.target.checked;
            config.options.useCustomAccentColor = useCustom;
            
            if (useCustom) {
                config.options.customAccentColor = colorPicker.value;
                updateAccentColor(colorPicker.value);
            } else {
                // Revert to base theme color
                updateAccentColor(config.baseTheme.accentColor);
            }
            
            saveOptions();
        });
    };
    
    // Create color picker when options popup is opened
    const optionsButton = document.getElementById('options-button');
    optionsButton.addEventListener('click', () => {
        // Short delay to ensure options popup is created
        setTimeout(createColorPickerUI, 50);
    });
    
    // Apply custom color if enabled on page load
    if (config.options.useCustomAccentColor && config.options.customAccentColor) {
        updateAccentColor(config.options.customAccentColor);
    }
}

// Update accent color throughout the site
export function updateAccentColor(color) {
    // Update CSS variable
    document.documentElement.style.setProperty('--accent-color', color);
    
    // Update config
    if (config.options.useCustomAccentColor) {
        config.options.customAccentColor = color;
        config.accentColor = color;
        saveOptions();
    } else {
        config.accentColor = color;
    }
}