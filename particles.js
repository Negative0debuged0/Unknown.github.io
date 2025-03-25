// Particle effects management
import config from './config.js';

// Update particle settings based on options
export function updateParticleSettings() {
    const densityMap = {
        'low': 0.5,
        'medium': 1,
        'high': 2
    };
    
    const speedMap = {
        'slow': 0.6,
        'medium': 1,
        'fast': 1.5
    };
    
    const density = densityMap[config.options.particleDensity] || 1;
    const speed = speedMap[config.options.particleSpeed] || 1;
    
    // Update floating particles
    const floatingParticles = document.querySelectorAll('.floating-particle');
    floatingParticles.forEach((particle, index) => {
        // Adjust size based on density
        const baseSize = parseFloat(particle.style.width);
        if (!isNaN(baseSize)) {
            particle.style.width = `${baseSize * 0.8 + density * 0.4}px`;
            particle.style.height = `${baseSize * 0.8 + density * 0.4}px`;
        }
        
        // Adjust speed
        const animDuration = parseFloat(particle.style.animationDuration);
        if (!isNaN(animDuration)) {
            particle.style.animationDuration = `${animDuration / speed}s`;
        }
    });
    
    // Similar adjustments for header particles
    const headerParticles = document.querySelectorAll('.header-particle');
    headerParticles.forEach(particle => {
        const baseSize = parseFloat(particle.style.width);
        if (!isNaN(baseSize)) {
            particle.style.width = `${baseSize * 0.8 + density * 0.4}px`;
            particle.style.height = `${baseSize * 0.8 + density * 0.4}px`;
        }
        
        const animDuration = parseFloat(particle.style.animationDuration);
        if (!isNaN(animDuration)) {
            particle.style.animationDuration = `${animDuration / speed}s`;
        }
    });
}

// Update animation settings based on options
export function updateAnimationSettings() {
    const intensityMap = {
        'subtle': 0.6,
        'medium': 1,
        'high': 1.5
    };
    
    const intensity = intensityMap[config.options.animationIntensity] || 1;
    
    // Adjust animation intensity
    document.documentElement.style.setProperty('--animation-intensity', intensity);
}