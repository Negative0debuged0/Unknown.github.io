// Object creation and management for Physics Sandbox
import config from '../config.js';

// Current object size multiplier
let objectSizeMultiplier = 1.0;

// Initialize object creation methods
export const initObjects = {
    // Set the size multiplier for new objects
    setObjectSizeMultiplier: (multiplier) => {
        objectSizeMultiplier = multiplier;
    },
    
    // Get current size multiplier
    getObjectSizeMultiplier: () => {
        return objectSizeMultiplier;
    },
    
    // Create a circle at the specified position
    createCircle: (x, y, world) => {
        const radius = (Math.random() * 20 + 20) * objectSizeMultiplier; // Random radius between 20-40, scaled
        
        const circle = Matter.Bodies.circle(x, y, radius, {
            restitution: 0.8, // Bounciness
            friction: 0.05,
            density: 0.001, // Makes objects lighter
            render: {
                fillStyle: getRandomColorFromTheme(),
                strokeStyle: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
                lineWidth: 1
            }
        });
        
        Matter.World.add(world, circle);
        return circle;
    },
    
    // Create a box at the specified position
    createBox: (x, y, world) => {
        const size = (Math.random() * 40 + 20) * objectSizeMultiplier; // Random size between 20-60, scaled
        
        const box = Matter.Bodies.rectangle(x, y, size, size, {
            restitution: 0.6,
            friction: 0.1,
            density: 0.002,
            render: {
                fillStyle: getRandomColorFromTheme(),
                strokeStyle: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
                lineWidth: 1
            }
        });
        
        Matter.World.add(world, box);
        return box;
    },
    
    // Create a polygon at the specified position
    createPolygon: (x, y, world) => {
        const sides = Math.floor(Math.random() * 4) + 3; // 3 to 6 sides
        const radius = (Math.random() * 25 + 15) * objectSizeMultiplier; // Random radius between 15-40, scaled
        
        const polygon = Matter.Bodies.polygon(x, y, sides, radius, {
            restitution: 0.7,
            friction: 0.08,
            density: 0.0015,
            render: {
                fillStyle: getRandomColorFromTheme(),
                strokeStyle: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
                lineWidth: 1
            }
        });
        
        Matter.World.add(world, polygon);
        return polygon;
    },
    
    // Create liquid drops/particles
    createLiquidParticle: (x, y, world) => {
        const radius = (Math.random() * 8 + 5) * objectSizeMultiplier;
        
        const particle = Matter.Bodies.circle(x, y, radius, {
            restitution: 0.9,
            friction: 0.01,
            frictionAir: 0.01,
            density: 0.0008,
            render: {
                fillStyle: 'rgba(0, 150, 255, 0.3)',
                strokeStyle: 'rgba(0, 180, 255, 0.5)',
                lineWidth: 1
            }
        });
        
        // Add a custom property to identify as liquid
        particle.isLiquid = true;
        
        Matter.World.add(world, particle);
        return particle;
    },
    
    // Create a compound object (like a car or complex structure)
    createCompoundObject: (x, y, world) => {
        // Create main body
        const mainBody = Matter.Bodies.rectangle(x, y, 80 * objectSizeMultiplier, 30 * objectSizeMultiplier, {
            render: {
                fillStyle: getRandomColorFromTheme()
            }
        });
        
        // Create wheels
        const wheelRadius = 15 * objectSizeMultiplier;
        const wheelOffset = 30 * objectSizeMultiplier;
        
        const wheelA = Matter.Bodies.circle(x - wheelOffset, y + 15 * objectSizeMultiplier, wheelRadius, {
            render: {
                fillStyle: '#333333'
            }
        });
        
        const wheelB = Matter.Bodies.circle(x + wheelOffset, y + 15 * objectSizeMultiplier, wheelRadius, {
            render: {
                fillStyle: '#333333'
            }
        });
        
        // Create a compound body
        const compound = Matter.Body.create({
            parts: [mainBody, wheelA, wheelB],
            restitution: 0.5,
            friction: 0.2,
            density: 0.002
        });
        
        Matter.World.add(world, compound);
        return compound;
    }
};

// Helper function to get a random color based on theme accent color
function getRandomColorFromTheme() {
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    const rgbValues = hexToRgb(accentColor);
    
    if (rgbValues) {
        // Create a random variation of the accent color
        const colorVariation = Math.random() * 0.4 - 0.2; // -0.2 to 0.2
        const r = Math.min(255, Math.max(0, rgbValues.r * (1 + colorVariation)));
        const g = Math.min(255, Math.max(0, rgbValues.g * (1 + colorVariation)));
        const b = Math.min(255, Math.max(0, rgbValues.b * (1 + colorVariation)));
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Fallback to a default color
    return '#ffffff';
}

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b, a) => {
        return r + r + g + g + b + b + (a ? a + a : '');
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: result[4] ? parseInt(result[4], 16) / 255 : 1
    } : null;
}