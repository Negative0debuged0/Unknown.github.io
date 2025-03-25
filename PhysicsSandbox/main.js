// Main entry point for Physics Sandbox
import config from '../config.js';
import { createEngine, setupLiquidPhysics } from './physics-engine.js';
import { initObjects } from './objects.js';
import { initRagdolls } from './ragdolls.js';
import { initOptions, toggleOption } from '../options.js';
import { createCustomCursor, toggleCursor } from '../cursor.js';
import { initColorPicker } from '../colorPicker.js';

// Initialize Matter.js variables
let engine, render, world, canvas, walls, runner;
let currentTool = 'circle';
let isDragging = false;
let mouseConstraint;
let dragBody = null;
let lastTimestamp = 0;
let framesThisSecond = 0;
let fps = 0;
let liquidPhysics;

// Environment settings
let gravityEnabled = true;
let liquidEnabled = false;
let windEnabled = false;
let windDirection = 1; // 1 for right, -1 for left
let windForce = 0.00005;

// Stats tracking
let objectCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Get shared config from parent window if in iframe, otherwise use local config
    if (window.parent && window.parent.sharedConfig) {
        Object.assign(config.options, window.parent.sharedConfig.options);
    } else {
        // Load options from localStorage if available
        const savedOptions = localStorage.getItem('zero-website-options');
        if (savedOptions) {
            try {
                const parsedOptions = JSON.parse(savedOptions);
                Object.assign(config.options, parsedOptions);
            } catch (error) {
                console.error('Error loading saved options', error);
            }
        }
    }
    
    // Share config with other modules
    window.sharedConfig = config;
    
    // Initialize options
    initOptions();
    
    // Initialize color picker
    initColorPicker();
    
    // Apply theme
    document.documentElement.style.setProperty('--accent-color', config.accentColor);
    
    // Initialize physics engine
    const physicsSetup = createEngine('physics-canvas');
    engine = physicsSetup.engine;
    render = physicsSetup.render;
    world = physicsSetup.world;
    canvas = physicsSetup.canvas;
    mouseConstraint = physicsSetup.mouseConstraint;
    walls = physicsSetup.walls;
    runner = physicsSetup.runner;
    
    // Initialize liquid physics
    liquidPhysics = setupLiquidPhysics(world, engine);
    
    // Set up tools
    const setupTools = () => {
        // Tool buttons
        const circleBtn = document.getElementById('circle-btn');
        const boxBtn = document.getElementById('box-btn');
        const polygonBtn = document.getElementById('polygon-btn');
        const ragdollBtn = document.getElementById('ragdoll-btn');
        const liquidBtn = document.getElementById('liquid-btn');
        const clearBtn = document.getElementById('clear-btn');
        
        // Set active tool
        const setActiveTool = (tool) => {
            currentTool = tool;
            
            // Remove active class from all buttons
            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to selected tool
            document.querySelector(`#${tool}-btn`)?.classList.add('active');
        };
        
        // Add click events to tool buttons
        circleBtn.addEventListener('click', () => setActiveTool('circle'));
        boxBtn.addEventListener('click', () => setActiveTool('box'));
        polygonBtn.addEventListener('click', () => setActiveTool('polygon'));
        ragdollBtn.addEventListener('click', () => setActiveTool('ragdoll'));
        liquidBtn.addEventListener('click', () => setActiveTool('liquid'));
        
        // Set circle as active by default
        setActiveTool('circle');
        
        // Clear button
        clearBtn.addEventListener('click', () => {
            Matter.World.clear(world, false);
            Matter.Engine.clear(engine);
            
            // Re-add mouse constraint
            Matter.World.add(world, mouseConstraint);
            
            // Restore walls
            Matter.World.add(world, [walls.ground, walls.ceiling, walls.leftWall, walls.rightWall]);
            
            // Update object counter
            objectCount = 0;
            updateObjectCounter();
        });
        
        // Canvas click handler
        canvas.addEventListener('click', (e) => {
            if (isDragging) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Create object based on selected tool
            if (currentTool === 'circle') {
                const circle = initObjects.createCircle(x, y, world);
                objectCount++;
            } else if (currentTool === 'box') {
                const box = initObjects.createBox(x, y, world);
                objectCount++;
            } else if (currentTool === 'polygon') {
                const polygon = initObjects.createPolygon(x, y, world);
                objectCount++;
            } else if (currentTool === 'ragdoll') {
                const ragdoll = initRagdolls.createRagdoll(x, y, world);
                objectCount += 10; // Ragdoll has multiple parts
            } else if (currentTool === 'liquid') {
                // Create multiple liquid particles in a splash pattern
                for (let i = 0; i < 10; i++) {
                    const offsetX = (Math.random() - 0.5) * 50;
                    const offsetY = (Math.random() - 0.5) * 50;
                    const liquid = initObjects.createLiquidParticle(x + offsetX, y + offsetY, world);
                    objectCount++;
                }
            }
            
            updateObjectCounter();
        });
        
        // Mouse events for drag detection
        canvas.addEventListener('mousedown', () => {
            isDragging = false;
        });
        
        canvas.addEventListener('mousemove', () => {
            if (mouseConstraint.body) {
                isDragging = true;
            }
        });
    };
    setupTools();
    
    // Initialize FPS counter
    const setupFPSCounter = () => {
        // Update FPS counter every second
        setInterval(() => {
            document.getElementById('fps-counter').textContent = fps.toFixed(0);
            fps = framesThisSecond;
            framesThisSecond = 0;
        }, 1000);
        
        // Count frames
        Matter.Events.on(render, 'afterRender', () => {
            framesThisSecond++;
        });
    };
    setupFPSCounter();
    
    // Update object counter
    const updateObjectCounter = () => {
        document.getElementById('object-count').textContent = objectCount;
    };
    updateObjectCounter();
    
    // Setup environment controls
    const setupEnvironmentControls = () => {
        const toggleGravityBtn = document.getElementById('toggle-gravity');
        const toggleLiquidBtn = document.getElementById('toggle-liquid');
        const toggleWindBtn = document.getElementById('toggle-wind');
        
        // Gravity toggle
        toggleGravityBtn.addEventListener('click', () => {
            gravityEnabled = !gravityEnabled;
            
            if (gravityEnabled) {
                engine.world.gravity.y = 1;
                engine.world.gravity.scale = 0.001;
                toggleGravityBtn.textContent = 'Gravity: On';
            } else {
                engine.world.gravity.y = 0;
                engine.world.gravity.scale = 0;
                toggleGravityBtn.textContent = 'Gravity: Off';
            }
            
            toggleGravityBtn.classList.toggle('active', gravityEnabled);
        });
        
        // Liquid toggle
        toggleLiquidBtn.addEventListener('click', () => {
            liquidEnabled = !liquidEnabled;
            
            liquidPhysics.toggleLiquid(liquidEnabled);
            toggleLiquidBtn.textContent = `Water: ${liquidEnabled ? 'On' : 'Off'}`;
            toggleLiquidBtn.classList.toggle('active', liquidEnabled);
        });
        
        // Wind toggle
        toggleWindBtn.addEventListener('click', () => {
            windEnabled = !windEnabled;
            
            if (windEnabled) {
                // Apply wind force in Matter.js
                Matter.Events.on(engine, 'beforeUpdate', applyWind);
                toggleWindBtn.textContent = 'Wind: On';
                
                // Periodically change wind direction
                if (!window.windInterval) {
                    window.windInterval = setInterval(() => {
                        windDirection = -windDirection;
                    }, 5000);
                }
            } else {
                // Remove wind event
                Matter.Events.off(engine, 'beforeUpdate', applyWind);
                toggleWindBtn.textContent = 'Wind: Off';
                
                if (window.windInterval) {
                    clearInterval(window.windInterval);
                    window.windInterval = null;
                }
            }
            
            toggleWindBtn.classList.toggle('active', windEnabled);
        });
    };
    
    // Function to apply wind force to all bodies
    const applyWind = (event) => {
        const bodies = Matter.Composite.allBodies(world);
        
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            
            // Don't apply wind to static bodies
            if (body.isStatic) continue;
            
            // Apply wind force
            Matter.Body.applyForce(body, body.position, {
                x: windDirection * windForce * body.area,
                y: 0
            });
        }
    };
    
    setupEnvironmentControls();
    
    // Set up size slider
    const setupSizeControls = () => {
        const sizeSlider = document.getElementById('size-slider');
        const sizeValue = document.getElementById('size-value');
        
        sizeSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            initObjects.setObjectSizeMultiplier(value);
            sizeValue.textContent = `${value.toFixed(1)}x`;
        });
    };
    
    setupSizeControls();
    
    // Initialize custom cursor if enabled
    if (config.options.customCursor) {
        createCustomCursor();
        
        // Ensure cursor is applied to all elements
        document.body.style.cursor = 'none';
        document.querySelectorAll('a, button, canvas, #options-button, .tool-btn, .close-options, .env-btn').forEach(el => {
            el.style.cursor = 'none';
        });
    }

    // Set up options button
    const optionsButton = document.getElementById('options-button');
    optionsButton.addEventListener('click', () => {
        const popup = document.querySelector('.options-popup');
        if (popup) {
            popup.classList.add('active');
        } else {
            // If popup doesn't exist, recreate it
            initOptions();
            setTimeout(() => {
                const newPopup = document.querySelector('.options-popup');
                if (newPopup) newPopup.classList.add('active');
            }, 50);
        }
    });
    
    // Ensure cursor is maintained after load
    window.addEventListener('load', () => {
        if (config.options.customCursor) {
            document.body.style.cursor = 'none';
            document.querySelectorAll('a, button, canvas, #options-button, .tool-btn, .env-btn').forEach(el => {
                el.style.cursor = 'none';
            });
        }
    });
});

// Expose to global scope for debugging
window.physicsSandbox = {
    engine,
    render,
    world,
    Matter
};