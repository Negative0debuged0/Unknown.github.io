// Configuration settings for the website
export default {
    // Site colors - you can change these values to customize the theme
    accentColor: '#ffffff', // Changed from red to white
    
    // Base theme (not selectable by user anymore)
    baseTheme: {
        mainBg: '#000000',
        cardBg: '#0a0a0a',
        textColor: '#ffffff',
        accentColor: '#ffffff',
        headerBg: '#000000',
        cardHover: '#0f0f0f',
        cardBorder: 'rgba(255, 255, 255, 0.2)',
        glitchColor1: '#0ff',
        glitchColor2: '#f0f'
    },
    
    // Project data
    projects: [
        {
            title: "Particle Playground",
            description: "An interactive playground for experimenting with particle simulations and effects.",
            link: "https://negative0debuged0.github.io/ParticlePlayground/",
            thumbnail: "/2025-03-25_13-45.png"
        },
        {
            title: "Button Hover Effects",
            description: "A collection of stylish button hover animations and effects for web interfaces.",
            link: "ButtonHoverEffects/index.html",
            thumbnail: "/2025-03-25_15-44.png"
        }
    ],
    
    // Options settings
    options: {
        customCursor: true,
        headerParticles: true,
        backgroundParticles: true,
        interactiveBackground: true,
        particleDensity: 'medium',
        particleSpeed: 'medium',
        animationIntensity: 'medium',
        useCustomAccentColor: false,
        customAccentColor: '#ffffff'
    }
};