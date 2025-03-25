import { createCustomCursor, toggleCursor } from '../../cursor.js';
import { initOptions, toggleOption } from '../../options.js';
import config from '../../config.js';
import { WhiteboardManager } from './whiteboard-manager.js';
import { ToolManager } from './tool-manager.js';
import { PropertyPanel } from './property-panel.js';
import { ElementManager } from './element-manager.js';
import { NetworkManager } from './network-manager.js';
import { HistoryManager } from './history-manager.js';

// Main application that initializes all components
document.addEventListener('DOMContentLoaded', () => {
    // Get shared config from parent window if in iframe, otherwise use local config
    const sharedConfig = window.parent.sharedConfig || config;
    if (window.parent.sharedConfig) {
        Object.assign(config.options, window.parent.sharedConfig.options);
    }

    // Apply any custom accent color
    document.documentElement.style.setProperty('--accent-color', config.accentColor);
    
    // Wait a brief moment to ensure styles are applied
    setTimeout(() => {
        // Initialize options
        initOptions();
        
        // Initialize custom cursor if enabled
        if (config.options.customCursor) {
            createCustomCursor();
            
            // Force cursor: none on document body and all elements
            document.body.style.cursor = 'none';
            document.querySelectorAll('a, button, input, select, canvas, #whiteboard-canvas, .tool-button, #options-button').forEach(el => {
                el.style.cursor = 'none';
            });
        }
        
        // Get the canvas and set dimensions
        const canvas = document.getElementById('whiteboard-canvas');
        const container = document.getElementById('canvas-container');
        
        // Get room ID 
        const roomId = generateRoomId();
        
        // Initialize components - order matters for dependency injection
        const historyManager = new HistoryManager();
        const propertyPanel = new PropertyPanel();
        const elementManager = new ElementManager(canvas, propertyPanel);
        const networkManager = new NetworkManager(roomId, elementManager, historyManager);
        const toolManager = new ToolManager(canvas, elementManager, propertyPanel);
        const whiteboardManager = new WhiteboardManager(
            canvas, 
            container, 
            toolManager, 
            elementManager, 
            propertyPanel,
            historyManager,
            networkManager
        );
        
        // Initialize whiteboard
        whiteboardManager.initialize();
        
        // Setup property panel callback
        propertyPanel.setPropertyChangeCallback((action, data) => {
            if (action === 'update') {
                elementManager.syncElement(data);
                historyManager.addState(elementManager.getAllElements());
            } else if (action === 'delete') {
                elementManager.removeElement(data);
            }
        });
        
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
        
        // Set up share button
        const shareButton = document.getElementById('share-button');
        shareButton.addEventListener('click', () => {
            showNotification('Save functionality available in local mode');
        });
        
        // Clear button
        const clearButton = document.getElementById('clear-button');
        clearButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the entire whiteboard?')) {
                whiteboardManager.clearWhiteboard();
            }
        });
    }, 100);
});

// Generate a random room ID
function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Show a notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}