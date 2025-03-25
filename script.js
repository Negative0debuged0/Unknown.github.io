// Configuration for the website
import config from './config.js';
import { initOptions, toggleOption } from './options.js';
import { createCustomCursor } from './cursor.js';
import { initColorPicker } from './colorPicker.js';
import { initComments } from './comments.js';

document.addEventListener('DOMContentLoaded', () => {
    // Apply any dynamic configurations
    document.documentElement.style.setProperty('--accent-color', config.accentColor);
    
    // Initialize options
    initOptions();
    
    // Initialize color picker
    initColorPicker();
    
    // Initialize comments section
    initComments();

    // Share config with ButtonHoverEffects
    window.sharedConfig = config;
    
    // Populate message in projects container
    const projectsContainer = document.querySelector('.projects-container');
    
    // Check if there are projects to display
    if (config.projects && config.projects.length > 0) {
        projectsContainer.innerHTML = ''; // Clear container
        
        // Create project cards
        config.projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            projectCard.innerHTML = `
                <h3>${project.title}</h3>
                ${project.thumbnail ? `<img src="${project.thumbnail}" alt="${project.title}" class="project-thumbnail">` : ''}
                <p>${project.description}</p>
                <a href="${project.link}" class="project-link" target="_blank">View Project</a>
            `;
            
            // Add click event to show popup
            projectCard.addEventListener('click', (e) => {
                // Don't trigger popup if clicking on the direct link
                if (!e.target.classList.contains('project-link')) {
                    showProjectPopup(project);
                }
            });
            
            projectsContainer.appendChild(projectCard);
        });
    } else {
        projectsContainer.innerHTML = '<h3>No projects available at this time</h3>';
    }
    
    // Add terminal-style blinking cursor to the h2 element
    const sectionTitle = document.querySelector('h2');
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'blinking-cursor';
    cursorSpan.innerHTML = '&#9608;'; // Block character
    sectionTitle.appendChild(cursorSpan);
    
    // Create custom cursor
    if (config.options.customCursor) {
        createCustomCursor();
    }
    
    // Create interactive background
    if (config.options.interactiveBackground) {
        createInteractiveBackground();
    }

    // Create floating particles for header
    if (config.options.headerParticles) {
        createHeaderParticles();
    }
    
    // Create floating background particles
    if (config.options.backgroundParticles) {
        createFloatingBackgroundParticles();
    }
    
    console.log('Zer0\'s Projects website loaded successfully!');
});

function createInteractiveBackground() {
    const container = document.createElement('div');
    container.className = 'interactive-bg';
    document.body.appendChild(container);
    
    const maxDots = 20;
    const dots = [];
    
    // Create background dots
    for (let i = 0; i < maxDots; i++) {
        const dot = document.createElement('div');
        dot.className = 'bg-dot';
        container.appendChild(dot);
        dots.push({ 
            element: dot, 
            size: Math.random() * 80 + 40, 
            active: false 
        });
        
        // Position the dot randomly off-screen initially
        dot.style.width = `${dots[i].size}px`;
        dot.style.height = `${dots[i].size}px`;
        dot.style.left = `-100px`;
        dot.style.top = `-100px`;
    }
    
    // Handle mouse movement
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Find an inactive dot to activate
        let activated = false;
        for (let i = 0; i < dots.length; i++) {
            if (!dots[i].active && !activated) {
                dots[i].active = true;
                activated = true;
                
                const dot = dots[i].element;
                dot.style.left = `${mouseX - dots[i].size / 2}px`;
                dot.style.top = `${mouseY - dots[i].size / 2}px`;
                dot.style.opacity = '0.08'; 
                dot.style.transform = 'scale(1)';
                
                // Deactivate after animation
                setTimeout(() => {
                    dot.style.opacity = '0';
                    dot.style.transform = 'scale(0)';
                    
                    // Reset after transition
                    setTimeout(() => {
                        dots[i].active = false;
                    }, 1000);
                }, 500);
            }
        }
    });
}

function createHeaderParticles() {
    const header = document.querySelector('header');
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'header-particles';
    header.appendChild(particlesContainer);
    
    const particlesCount = 20;
    
    for (let i = 0; i < particlesCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'header-particle';
        
        // Randomize particle properties
        const size = Math.random() * 4 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.opacity = (Math.random() * 0.2 + 0.05).toString();
        
        particlesContainer.appendChild(particle);
    }
}

function createFloatingBackgroundParticles() {
    const container = document.createElement('div');
    container.className = 'floating-bg-particles';
    document.body.appendChild(container);
    
    const particlesCount = 50;
    const particles = [];
    
    for (let i = 0; i < particlesCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        // Randomize particle properties
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 60 + 30;
        const delay = Math.random() * 10;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.opacity = (Math.random() * 0.2 + 0.05).toString();
        
        container.appendChild(particle);
        
        // Store particle information for mouse interaction
        particles.push({
            element: particle,
            x: posX,
            y: posY,
            size: size,
            speed: 0.05 + Math.random() * 0.1,
            originalX: posX,
            originalY: posY,
        });
    }
    
    // Add mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 100;
        mouseY = (e.clientY / window.innerHeight) * 100;
    });
    
    // Animation loop for mouse interaction
    function animateParticles() {
        particles.forEach(particle => {
            // Calculate distance between mouse and particle
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Apply attraction force if mouse is close
            if (distance < 30) {
                // Stronger attraction when closer
                const force = (30 - distance) / 30;
                
                // Move towards mouse
                particle.x += dx * force * particle.speed;
                particle.y += dy * force * particle.speed;
            } else {
                // Return slowly to original position
                particle.x += (particle.originalX - particle.x) * 0.01;
                particle.y += (particle.originalY - particle.y) * 0.01;
            }
            
            // Update particle position
            particle.element.style.left = `${particle.x}%`;
            particle.element.style.top = `${particle.y}%`;
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

function showProjectPopup(project) {
    // Create popup elements
    const popup = document.createElement('div');
    popup.className = 'project-popup';
    
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    
    // Create close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-popup';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.removeChild(popup);
    });
    
    // Create popup content
    popupContent.innerHTML = `
        <h2>${project.title}</h2>
        ${project.thumbnail ? `<img src="${project.thumbnail}" alt="${project.title}" class="popup-thumbnail">` : ''}
        <div class="popup-description">
            <p>${project.description}</p>
            <p>This project showcases interactive features and dynamic content. Click the link below to explore it further.</p>
        </div>
        <a href="${project.link}" class="project-link popup-link" target="_blank">Open Project</a>
    `;
    
    // Add elements to DOM
    popupContent.appendChild(closeBtn);
    popup.appendChild(popupContent);
    document.body.appendChild(popup);
    
    // Close popup when clicking outside of content
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
    
    // Add popup entrance animation
    setTimeout(() => {
        popup.style.opacity = '1';
        popupContent.style.transform = 'translateY(0)';
    }, 10);
}