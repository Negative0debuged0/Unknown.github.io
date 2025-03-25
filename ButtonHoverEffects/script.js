// Sync with main website
import { createCustomCursor, toggleCursor } from '../cursor.js';
import { initOptions, toggleOption } from '../options.js';
import config from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get shared config from parent window if in iframe, otherwise use local config
    const sharedConfig = window.parent.sharedConfig || config;
    if (window.parent.sharedConfig) {
        Object.assign(config.options, window.parent.sharedConfig.options);
    }
    
    // Initialize options panel
    initOptions();
    
    // Fix options button functionality
    const optionsButton = document.getElementById('options-button');
    const toggleOptionsPopup = (show) => {
        const popup = document.querySelector('.options-popup');
        if (popup) {
            if (show) {
                popup.classList.add('active');
            } else {
                popup.classList.remove('active');
            }
        }
    };
    
    optionsButton.addEventListener('click', () => {
        toggleOptionsPopup(true);
    });
    
    // Initialize split-text content for all split-text elements
    const splitTextElements = document.querySelectorAll('.split-text-content');
    splitTextElements.forEach(element => {
        element.setAttribute('data-content', element.textContent);
    });
    
    // Initialize magnetic pull buttons
    const magneticButtons = document.querySelectorAll('.magnetic-pull');
    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x/8}px, ${y/8}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
    
    // Setup for new buttons
    
    // Character Rise
    const characterRiseBtn = document.querySelector('.character-rise');
    if (characterRiseBtn) {
        const text = characterRiseBtn.textContent;
        characterRiseBtn.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
                characterRiseBtn.innerHTML += ' ';
            } else {
                characterRiseBtn.innerHTML += `<span>${text[i]}</span>`;
            }
        }
    }
    
    // Text Wave
    const textWaveBtn = document.querySelector('.text-wave');
    if (textWaveBtn) {
        const text = textWaveBtn.textContent;
        textWaveBtn.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
                textWaveBtn.innerHTML += ' ';
            } else {
                textWaveBtn.innerHTML += `<span>${text[i]}</span>`;
            }
        }
    }
    
    // Staggered Rise
    const staggeredRiseBtn = document.querySelector('.staggered-rise');
    if (staggeredRiseBtn) {
        const text = staggeredRiseBtn.textContent;
        staggeredRiseBtn.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
                staggeredRiseBtn.innerHTML += ' ';
            } else {
                staggeredRiseBtn.innerHTML += `<span>${text[i]}</span>`;
            }
        }
    }
    
    // Character Parade
    const characterParadeBtn = document.querySelector('.character-parade');
    if (characterParadeBtn) {
        const text = characterParadeBtn.textContent;
        characterParadeBtn.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
                characterParadeBtn.innerHTML += ' ';
            } else {
                characterParadeBtn.innerHTML += `<span>${text[i]}</span>`;
            }
        }
    }
    
    // Letter Flip
    const letterFlipBtn = document.querySelector('.letter-flip');
    if (letterFlipBtn) {
        const text = letterFlipBtn.textContent;
        letterFlipBtn.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
                letterFlipBtn.innerHTML += ' ';
            } else {
                letterFlipBtn.innerHTML += `<span>${text[i]}</span>`;
            }
        }
    }
    
    // Spotlight Track
    const spotlightTrackBtn = document.querySelector('.spotlight-track');
    if (spotlightTrackBtn) {
        spotlightTrackBtn.addEventListener('mousemove', (e) => {
            const rect = spotlightTrackBtn.getBoundingClientRect();
            const spotlightX = e.clientX - rect.left;
            const spotlightY = e.clientY - rect.top;
            
            spotlightTrackBtn.style.setProperty('--spotlight-x', `${spotlightX - 25}px`);
            spotlightTrackBtn.style.setProperty('--spotlight-y', `${spotlightY - 25}px`);
        });
        
        spotlightTrackBtn.addEventListener('mouseenter', () => {
            spotlightTrackBtn.querySelector('::before');
            const before = window.getComputedStyle(spotlightTrackBtn, '::before');
            if (before) {
                before.opacity = '0.7';
            }
            spotlightTrackBtn.style.setProperty('--spotlight-opacity', '0.7');
        });
        
        spotlightTrackBtn.addEventListener('mouseleave', () => {
            spotlightTrackBtn.style.setProperty('--spotlight-opacity', '0');
        });
    }

    // Fix Snake Border button
    const snakeBorderBtn = document.querySelector('.snake-border');
    if (snakeBorderBtn) {
        snakeBorderBtn.addEventListener('mouseenter', () => {
            snakeBorderBtn.style.position = 'relative';
            const beforeElem = snakeBorderBtn.querySelector('::before');
            if (beforeElem) {
                beforeElem.style.animation = 'snakeBorder 1.5s linear infinite';
            }
        });
    }
    
    // Fix Echo Effect
    const echoEffectBtn = document.querySelector('.echo-effect');
    if (echoEffectBtn) {
        echoEffectBtn.addEventListener('mouseenter', () => {
            echoEffectBtn.style.animation = 'echoEffect 1s ease infinite';
        });
        
        echoEffectBtn.addEventListener('mouseleave', () => {
            echoEffectBtn.style.animation = 'none';
        });
    }
    
    // Fix Sonar Effect
    const sonarEffectBtn = document.querySelector('.sonar-effect');
    if (sonarEffectBtn) {
        sonarEffectBtn.addEventListener('mouseenter', () => {
            const pseudo = document.createElement('div');
            pseudo.style.position = 'absolute';
            pseudo.style.top = '0';
            pseudo.style.left = '0';
            pseudo.style.width = '100%';
            pseudo.style.height = '100%';
            pseudo.style.borderRadius = '5px';
            pseudo.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color');
            pseudo.style.zIndex = '-1';
            pseudo.style.animation = 'sonarEffect 1s ease infinite';
            
            sonarEffectBtn.style.position = 'relative';
            sonarEffectBtn.style.overflow = 'visible';
            
            if (!sonarEffectBtn.querySelector('.sonar-pseudo')) {
                pseudo.classList.add('sonar-pseudo');
                sonarEffectBtn.appendChild(pseudo);
            }
        });
        
        sonarEffectBtn.addEventListener('mouseleave', () => {
            const pseudo = sonarEffectBtn.querySelector('.sonar-pseudo');
            if (pseudo) {
                sonarEffectBtn.removeChild(pseudo);
            }
        });
    }
    
    // Initialize custom cursor if enabled
    if (config.options.customCursor) {
        createCustomCursor();
        
        // Apply cursor: none to document body
        document.body.style.cursor = 'none';
        
        // Ensure cursor is applied to all clickable elements
        document.querySelectorAll('a, button, .hover-btn, .flipper, #options-button, .close-popup, .close-options, .button-card, .front, .back').forEach(el => {
            el.style.cursor = 'none';
        });
        
        // Ensure cursor styles are applied to the new buttons too
        document.querySelectorAll('.skew-transform, .expanding-border, .letter-spacing, .rotating-icon, .slice-animation, .bounce-effect, .blur-shadow').forEach(el => {
            el.style.cursor = 'none';
        });
    }
    
    // Apply cursor: none to all new buttons
    document.querySelectorAll('.hover-btn, .button-card, .front, .back').forEach(el => {
        el.style.cursor = 'none';
    });
    
    // Style adjustments based on accent color
    document.documentElement.style.setProperty('--accent-color', sharedConfig?.accentColor || config.accentColor);
    
    // Reapply cursor styles on window focus
    window.addEventListener('focus', () => {
        if (config.options.customCursor) {
            document.body.style.cursor = 'none';
            document.querySelectorAll('*').forEach(el => {
                el.style.cursor = 'none';
            });
        }
    });
});