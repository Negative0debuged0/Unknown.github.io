import config from './config.js';
import { applyTheme, saveOptions, loadOptions } from './themes.js';
import { updateParticleSettings, updateAnimationSettings } from './particles.js';
import { toggleCursor } from './cursor.js';

// Create the options popup structure
function createOptionsPopup() {
    const popup = document.createElement('div');
    popup.className = 'options-popup';
    
    const content = document.createElement('div');
    content.className = 'options-content';
    
    // Create close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-options';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleOptionsPopup(false);
    });
    
    content.innerHTML = `
        <h3>Options</h3>
        <div class="options-list">
            <div class="option-section">
                <h4>Toggle Features</h4>
                <div class="option-item">
                    <span class="option-title">Custom Cursor</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="toggle-cursor" ${config.options.customCursor ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="option-item">
                    <span class="option-title">Header Particles</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="toggle-header-particles" ${config.options.headerParticles ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="option-item">
                    <span class="option-title">Background Particles</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="toggle-bg-particles" ${config.options.backgroundParticles ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="option-item">
                    <span class="option-title">Interactive Background</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="toggle-interactive-bg" ${config.options.interactiveBackground ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="option-section">
                <h4>Particle Settings</h4>
                <div class="option-item">
                    <span class="option-title">Particle Density</span>
                    <select id="particle-density" class="option-dropdown">
                        <option value="low" ${config.options.particleDensity === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${config.options.particleDensity === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${config.options.particleDensity === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>
                <div class="option-item">
                    <span class="option-title">Particle Speed</span>
                    <select id="particle-speed" class="option-dropdown">
                        <option value="slow" ${config.options.particleSpeed === 'slow' ? 'selected' : ''}>Slow</option>
                        <option value="medium" ${config.options.particleSpeed === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="fast" ${config.options.particleSpeed === 'fast' ? 'selected' : ''}>Fast</option>
                    </select>
                </div>
                <div class="option-item">
                    <span class="option-title">Animation Intensity</span>
                    <select id="animation-intensity" class="option-dropdown">
                        <option value="subtle" ${config.options.animationIntensity === 'subtle' ? 'selected' : ''}>Subtle</option>
                        <option value="medium" ${config.options.animationIntensity === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${config.options.animationIntensity === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    
    content.appendChild(closeBtn);
    popup.appendChild(content);
    document.body.appendChild(popup);
    
    // Close popup when clicking outside content
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            toggleOptionsPopup(false);
        }
    });
    
    // Set up event listeners for toggle switches
    document.getElementById('toggle-cursor').addEventListener('change', (e) => {
        toggleOption('customCursor', e.target.checked);
    });
    
    document.getElementById('toggle-header-particles').addEventListener('change', (e) => {
        toggleOption('headerParticles', e.target.checked);
    });
    
    document.getElementById('toggle-bg-particles').addEventListener('change', (e) => {
        toggleOption('backgroundParticles', e.target.checked);
    });
    
    document.getElementById('toggle-interactive-bg').addEventListener('change', (e) => {
        toggleOption('interactiveBackground', e.target.checked);
    });
    
    // Add particle settings listeners
    document.getElementById('particle-density').addEventListener('change', (e) => {
        toggleOption('particleDensity', e.target.value);
        updateParticleSettings();
    });
    
    document.getElementById('particle-speed').addEventListener('change', (e) => {
        toggleOption('particleSpeed', e.target.value);
        updateParticleSettings();
    });
    
    document.getElementById('animation-intensity').addEventListener('change', (e) => {
        toggleOption('animationIntensity', e.target.value);
        updateAnimationSettings();
    });
    
    return popup;
}

// Toggle the options popup
function toggleOptionsPopup(show) {
    const popup = document.querySelector('.options-popup');
    if (show) {
        popup.classList.add('active');
    } else {
        popup.classList.remove('active');
    }
}

// Initialize options
export function initOptions() {
    // Create options popup
    const popup = createOptionsPopup();
    
    // Setup options button
    const optionsButton = document.getElementById('options-button');
    optionsButton.addEventListener('click', () => {
        toggleOptionsPopup(true);
    });
}

// Toggle an option
export function toggleOption(option, value) {
    // Update config
    config.options[option] = value;
    
    // Apply changes immediately
    applyOptions();
    
    // Save to localStorage for persistence
    saveOptions();
}

// Apply the current options
function applyOptions() {
    // Apply base theme with current color settings
    applyTheme();
    
    // Custom Cursor
    toggleCursor(config.options.customCursor);
    
    // Header Particles
    const headerParticles = document.querySelector('.header-particles');
    if (headerParticles) {
        headerParticles.style.display = config.options.headerParticles ? 'block' : 'none';
    } else if (config.options.headerParticles) {
        const createHeaderParticles = window.createHeaderParticles;
        if (typeof createHeaderParticles === 'function') {
            createHeaderParticles();
        }
    }
    
    // Background Particles
    const bgParticles = document.querySelector('.floating-bg-particles');
    if (bgParticles) {
        bgParticles.style.display = config.options.backgroundParticles ? 'block' : 'none';
    } else if (config.options.backgroundParticles) {
        const createFloatingBackgroundParticles = window.createFloatingBackgroundParticles;
        if (typeof createFloatingBackgroundParticles === 'function') {
            createFloatingBackgroundParticles();
        }
    }
    
    // Interactive Background
    const interactiveBg = document.querySelector('.interactive-bg');
    if (interactiveBg) {
        interactiveBg.style.display = config.options.interactiveBackground ? 'block' : 'none';
    } else if (config.options.interactiveBackground) {
        const createInteractiveBackground = window.createInteractiveBackground;
        if (typeof createInteractiveBackground === 'function') {
            createInteractiveBackground();
        }
    }
    
    // Update particle settings
    updateParticleSettings();
    
    // Update animation settings
    updateAnimationSettings();
}