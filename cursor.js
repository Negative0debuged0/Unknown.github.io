// Custom cursor functionality
import config from './config.js';

// Create custom cursor
export function createCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);
    
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);
    
    // Add SVG container for custom cursor shapes
    const cursorSvg = document.createElement('div');
    cursorSvg.className = 'cursor-svg';
    cursorSvg.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle class="cursor-click-circle" cx="20" cy="20" r="15" stroke="var(--accent-color)" stroke-width="1.5" opacity="0"/>
            <path class="cursor-arrow" d="M20 10L10 30L20 25L30 30L20 10Z" fill="var(--accent-color)" opacity="0"/>
            <rect class="cursor-plus-h" x="13" y="19" width="14" height="2" fill="var(--accent-color)" opacity="0"/>
            <rect class="cursor-plus-v" x="19" y="13" width="2" height="14" fill="var(--accent-color)" opacity="0"/>
        </svg>
    `;
    document.body.appendChild(cursorSvg);
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let cursorDotX = 0, cursorDotY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Create a smoother animation loop
    function animateCursor() {
        // Calculate the distance between cursor position and target position
        const lagFactor = 0.15; // Reduced for more responsiveness
        const dotLagFactor = 0.3; // Faster for cursor dot
        
        // Apply easing to cursor movement
        cursorX += (mouseX - cursorX) * lagFactor;
        cursorY += (mouseY - cursorY) * lagFactor;
        
        // The dot follows slightly faster than the circle
        cursorDotX += (mouseX - cursorDotX) * dotLagFactor;
        cursorDotY += (mouseY - cursorDotY) * dotLagFactor;
        
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        cursorDot.style.left = `${cursorDotX}px`;
        cursorDot.style.top = `${cursorDotY}px`;
        
        cursorSvg.style.left = `${cursorX}px`;
        cursorSvg.style.top = `${cursorY}px`;
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Hide default cursor on all elements
    document.querySelectorAll('*').forEach(el => {
        el.style.cursor = 'none';
    });
    
    // Handle cursor disappearing when leaving window
    document.addEventListener('mouseout', () => {
        cursor.style.opacity = '0';
        cursorDot.style.opacity = '0';
        cursorSvg.style.opacity = '0';
    });
    
    document.addEventListener('mouseover', () => {
        cursor.style.opacity = '1';
        cursorDot.style.opacity = '1';
        cursorSvg.style.opacity = '1';
    });
    
    // Add subtle rotation based on movement direction
    let lastMouseX = 0;
    let lastMouseY = 0;
    let rotationAngle = 0;
    
    setInterval(() => {
        // Calculate movement direction
        const moveX = mouseX - lastMouseX;
        const moveY = mouseY - lastMouseY;
        
        if (Math.abs(moveX) > 1 || Math.abs(moveY) > 1) {
            rotationAngle = Math.atan2(moveY, moveX) * (180 / Math.PI);
            cursor.style.transform = `translate(-50%, -50%) rotate(${rotationAngle}deg) scale(${Math.min(1 + Math.abs(moveX + moveY) * 0.003, 1.15)})`;
        } else {
            cursor.style.transform = `translate(-50%, -50%) scale(1)`;
        }
        
        lastMouseX = mouseX;
        lastMouseY = mouseY;
    }, 50);
    
    // Update cursor on dynamic elements as they're added to the DOM
    function setupCursorForClickableElements() {
        // Expand cursor on clickable elements
        const clickableElements = document.querySelectorAll('a, button, .project-card, #options-button, .close-popup, .close-options');
        clickableElements.forEach(element => {
            element.style.cursor = 'none';
            
            element.addEventListener('mouseenter', () => {
                cursor.style.width = '40px';
                cursor.style.height = '40px';
                cursor.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
                cursor.style.mixBlendMode = 'screen';
                
                // Show plus icon for clickable elements
                const plusH = cursorSvg.querySelector('.cursor-plus-h');
                const plusV = cursorSvg.querySelector('.cursor-plus-v');
                if (plusH && plusV) {
                    plusH.style.opacity = '1';
                    plusV.style.opacity = '1';
                }
                
                // Show click circle animation
                const clickCircle = cursorSvg.querySelector('.cursor-click-circle');
                if (clickCircle) {
                    clickCircle.style.opacity = '0.8';
                    clickCircle.style.animation = 'pulse 1.5s infinite';
                }
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursor.style.backgroundColor = 'transparent';
                cursor.style.mixBlendMode = 'difference';
                
                // Hide custom cursor elements
                const svgElements = cursorSvg.querySelectorAll('circle, path, rect');
                svgElements.forEach(el => {
                    el.style.opacity = '0';
                    el.style.animation = 'none';
                });
            });
        });
        
        // Add different cursor shape for links
        const links = document.querySelectorAll('a, .project-link');
        links.forEach(link => {
            link.style.cursor = 'none';
            
            link.addEventListener('mouseenter', () => {
                // Show arrow for links
                const arrow = cursorSvg.querySelector('.cursor-arrow');
                if (arrow) {
                    arrow.style.opacity = '0.8';
                    
                    // Hide plus icons
                    const plusH = cursorSvg.querySelector('.cursor-plus-h');
                    const plusV = cursorSvg.querySelector('.cursor-plus-v');
                    if (plusH && plusV) {
                        plusH.style.opacity = '0';
                        plusV.style.opacity = '0';
                    }
                }
            });
        });
    }
    
    // Initial setup
    setupCursorForClickableElements();
    
    // Set up mutation observer to detect dynamically added elements
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                setupCursorForClickableElements();
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Add click animation
    document.addEventListener('mousedown', () => {
        cursor.style.transform = `translate(-50%, -50%) scale(0.8)`;
        cursorDot.style.transform = `translate(-50%, -50%) scale(0.8)`;
        cursorSvg.style.transform = `translate(-50%, -50%) scale(0.8)`;
    });
    
    document.addEventListener('mouseup', () => {
        cursor.style.transform = `translate(-50%, -50%) scale(1)`;
        cursorDot.style.transform = `translate(-50%, -50%) scale(1)`;
        cursorSvg.style.transform = `translate(-50%, -50%) scale(1)`;
    });
    
    // Change cursor appearance on text elements
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, li');
    textElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.width = '3px';
            cursor.style.height = '25px';
            cursor.style.borderRadius = '1px';
            cursor.style.backgroundColor = 'var(--accent-color)';
            cursor.style.opacity = '0.7';
            cursorDot.style.opacity = '0';
            
            // Hide custom cursor elements
            const svgElements = cursorSvg.querySelectorAll('circle, path, rect');
            svgElements.forEach(el => {
                el.style.opacity = '0';
            });
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.borderRadius = '50%';
            cursor.style.backgroundColor = 'transparent';
            cursor.style.opacity = '1';
            cursorDot.style.opacity = '1';
        });
    });
}

// Toggle cursor visibility based on options
export function toggleCursor(enabled) {
    if (enabled) {
        document.body.style.cursor = 'none';
        const cursor = document.querySelector('.cursor');
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorSvg = document.querySelector('.cursor-svg');
        
        if (cursor) {
            cursor.style.display = 'block';
            cursorDot.style.display = 'block';
            cursorSvg.style.display = 'block';
        } else {
            createCustomCursor();
        }
    } else {
        document.body.style.cursor = 'auto';
        const cursor = document.querySelector('.cursor');
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorSvg = document.querySelector('.cursor-svg');
        
        if (cursor) {
            cursor.style.display = 'none';
            cursorDot.style.display = 'none';
            cursorSvg.style.display = 'none';
        }
        
        // Reset cursor for all elements
        document.querySelectorAll('*').forEach(el => {
            el.style.cursor = '';
        });
    }
}