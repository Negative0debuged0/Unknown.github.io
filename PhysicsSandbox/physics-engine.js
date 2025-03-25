// Physics engine setup and configuration for the sandbox
import config from '../config.js';

// Create the Matter.js engine, renderer, and world
export function createEngine(canvasId) {
    // Module aliases
    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World;

    // Create engine
    const engine = Engine.create({
        // Add customization options
        gravity: {
            x: 0,
            y: 1,
            scale: 0.001
        },
        enableSleeping: true
    });
    
    const world = engine.world;
    
    // Create renderer
    const canvas = document.getElementById(canvasId);
    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent',
            showAngleIndicator: false,
            showCollisions: true,
            showVelocity: true
        }
    });
    
    // Create runner
    const runner = Runner.create();
    
    // Add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });
    
    World.add(world, mouseConstraint);
    
    // Keep the mouse in sync with rendering
    render.mouse = mouse;
    
    // Ensure render and runner are running
    Render.run(render);
    Runner.run(runner, engine);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Update canvas size
        render.options.width = window.innerWidth;
        render.options.height = window.innerHeight;
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        
        // Update boundary walls when resizing
        updateBoundaryWalls(world, walls);
    });
    
    // Apply custom styles to Matter.js objects
    setupCustomRendering(render);
    
    // Add boundary walls
    const walls = createBoundaryWalls(world, canvas);
    
    return {
        engine,
        render,
        world,
        canvas,
        mouseConstraint,
        walls,
        runner
    };
}

// Setup custom rendering options for objects
function setupCustomRendering(render) {
    const renderOptions = render.options;
    
    // Use custom colors from our theme
    render.options.wireframeBackground = 'transparent';

    // Add custom rendering support for liquid particles
    Matter.Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: window.innerWidth, y: window.innerHeight }
    });
}

// Create boundary walls for the simulation
function createBoundaryWalls(world, canvas) {
    const wallThickness = 50;
    
    // Create boundary walls
    const ground = Matter.Bodies.rectangle(
        window.innerWidth / 2, 
        window.innerHeight + wallThickness / 2, 
        window.innerWidth * 2, 
        wallThickness, 
        { isStatic: true, label: 'ground' }
    );
    
    const ceiling = Matter.Bodies.rectangle(
        window.innerWidth / 2, 
        -wallThickness / 2, 
        window.innerWidth * 2, 
        wallThickness, 
        { isStatic: true, label: 'ceiling' }
    );
    
    const leftWall = Matter.Bodies.rectangle(
        -wallThickness / 2, 
        window.innerHeight / 2, 
        wallThickness, 
        window.innerHeight * 2, 
        { isStatic: true, label: 'leftWall' }
    );
    
    const rightWall = Matter.Bodies.rectangle(
        window.innerWidth + wallThickness / 2, 
        window.innerHeight / 2, 
        wallThickness, 
        window.innerHeight * 2, 
        { isStatic: true, label: 'rightWall' }
    );
    
    // Add walls to the world
    Matter.World.add(world, [ground, ceiling, leftWall, rightWall]);
    
    // Make walls invisible
    [ground, ceiling, leftWall, rightWall].forEach(wall => {
        wall.render.opacity = 0.2;
        wall.render.fillStyle = '#333333';
        wall.render.strokeStyle = '#555555';
    });
    
    return { ground, ceiling, leftWall, rightWall };
}

// Update boundary walls positions when window is resized
function updateBoundaryWalls(world, walls) {
    const wallThickness = 50;
    
    // Update positions of walls
    Matter.Body.setPosition(walls.ground, {
        x: window.innerWidth / 2,
        y: window.innerHeight + wallThickness / 2
    });
    
    Matter.Body.setPosition(walls.ceiling, {
        x: window.innerWidth / 2,
        y: -wallThickness / 2
    });
    
    Matter.Body.setPosition(walls.leftWall, {
        x: -wallThickness / 2,
        y: window.innerHeight / 2
    });
    
    Matter.Body.setPosition(walls.rightWall, {
        x: window.innerWidth + wallThickness / 2,
        y: window.innerHeight / 2
    });
    
    // Update wall sizes
    Matter.Body.setVertices(walls.ground, Matter.Bodies.rectangle(
        window.innerWidth / 2,
        window.innerHeight + wallThickness / 2,
        window.innerWidth * 2,
        wallThickness,
        { isStatic: true }
    ).vertices);
    
    Matter.Body.setVertices(walls.ceiling, Matter.Bodies.rectangle(
        window.innerWidth / 2,
        -wallThickness / 2,
        window.innerWidth * 2,
        wallThickness,
        { isStatic: true }
    ).vertices);
    
    Matter.Body.setVertices(walls.leftWall, Matter.Bodies.rectangle(
        -wallThickness / 2,
        window.innerHeight / 2,
        wallThickness,
        window.innerHeight * 2,
        { isStatic: true }
    ).vertices);
    
    Matter.Body.setVertices(walls.rightWall, Matter.Bodies.rectangle(
        window.innerWidth + wallThickness / 2,
        window.innerHeight / 2,
        wallThickness,
        window.innerHeight * 2,
        { isStatic: true }
    ).vertices);
}

// Create liquid physics simulation
export function setupLiquidPhysics(world, engine) {
    // Create particles representing water
    const liquidParticles = [];
    const particleOptions = {
        friction: 0.05,
        frictionAir: 0.01,
        restitution: 0.7,
        density: 0.0008,
        render: {
            fillStyle: 'rgba(0, 150, 255, 0.2)',
            strokeStyle: 'rgba(0, 180, 255, 0.4)',
            lineWidth: 1
        }
    };

    // Apply liquid behavior to all objects in the liquid area
    let liquidEnabled = false;
    const liquidEventHandler = function() {
        if (!liquidEnabled) return;
        
        const bodies = Matter.Composite.allBodies(world);
        const liquidTop = window.innerHeight * 0.7; // Top of liquid area
        
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            
            // Skip static bodies like walls
            if (body.isStatic) continue;
            
            const bodyBottom = body.position.y + body.bounds.max.y - body.bounds.min.y;
            const bodyTop = body.position.y;
            
            // If body is partially or fully submerged
            if (bodyBottom > liquidTop) {
                // Calculate submerged percentage
                const submergedPercentage = Math.min(1, (bodyBottom - liquidTop) / (bodyBottom - bodyTop));
                
                // Apply buoyancy force proportional to volume and density
                const buoyancyForce = submergedPercentage * body.mass * 0.001;
                Matter.Body.applyForce(body, body.position, {
                    x: 0,
                    y: -buoyancyForce
                });
                
                // Apply drag force
                const velocity = body.velocity;
                const dragCoefficient = 0.002;
                
                Matter.Body.applyForce(body, body.position, {
                    x: -velocity.x * dragCoefficient * submergedPercentage,
                    y: -velocity.y * dragCoefficient * submergedPercentage
                });
            }
        }
    };
    
    Matter.Events.on(engine, 'beforeUpdate', liquidEventHandler);
    
    return {
        toggleLiquid: function(enabled) {
            liquidEnabled = enabled;
            const liquidContainer = document.getElementById('liquid-container');
            if (enabled) {
                liquidContainer.style.display = 'block';
            } else {
                liquidContainer.style.display = 'none';
            }
        }
    };
}