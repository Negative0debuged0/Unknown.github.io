// Ragdoll creation and management for Physics Playground
import config from '../config.js';

// Initialize ragdoll creation methods
export const initRagdolls = {
    // Create a ragdoll at the specified position
    createRagdoll: (x, y, world) => {
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        const scale = 0.7; // Scale the ragdoll size
        
        // Define ragdoll parts
        // Head
        const head = Matter.Bodies.circle(x, y - 60 * scale, 30 * scale, {
            render: {
                fillStyle: accentColor,
                strokeStyle: '#ffffff',
                lineWidth: 1
            },
            label: 'head'
        });
        
        // Torso (body)
        const torso = Matter.Bodies.rectangle(x, y, 50 * scale, 80 * scale, {
            render: {
                fillStyle: accentColor,
                strokeStyle: '#ffffff',
                lineWidth: 1
            },
            label: 'torso'
        });
        
        // Arms
        const leftUpperArm = Matter.Bodies.rectangle(x - 40 * scale, y - 20 * scale, 40 * scale, 15 * scale, {
            render: { fillStyle: accentColor },
            label: 'leftUpperArm'
        });
        
        const leftLowerArm = Matter.Bodies.rectangle(x - 70 * scale, y - 20 * scale, 40 * scale, 15 * scale, {
            render: { fillStyle: accentColor },
            label: 'leftLowerArm'
        });
        
        const rightUpperArm = Matter.Bodies.rectangle(x + 40 * scale, y - 20 * scale, 40 * scale, 15 * scale, {
            render: { fillStyle: accentColor },
            label: 'rightUpperArm'
        });
        
        const rightLowerArm = Matter.Bodies.rectangle(x + 70 * scale, y - 20 * scale, 40 * scale, 15 * scale, {
            render: { fillStyle: accentColor },
            label: 'rightLowerArm'
        });
        
        // Legs
        const leftUpperLeg = Matter.Bodies.rectangle(x - 15 * scale, y + 60 * scale, 15 * scale, 50 * scale, {
            render: { fillStyle: accentColor },
            label: 'leftUpperLeg'
        });
        
        const leftLowerLeg = Matter.Bodies.rectangle(x - 15 * scale, y + 100 * scale, 15 * scale, 50 * scale, {
            render: { fillStyle: accentColor },
            label: 'leftLowerLeg'
        });
        
        const rightUpperLeg = Matter.Bodies.rectangle(x + 15 * scale, y + 60 * scale, 15 * scale, 50 * scale, {
            render: { fillStyle: accentColor },
            label: 'rightUpperLeg'
        });
        
        const rightLowerLeg = Matter.Bodies.rectangle(x + 15 * scale, y + 100 * scale, 15 * scale, 50 * scale, {
            render: { fillStyle: accentColor },
            label: 'rightLowerLeg'
        });
        
        // Define constraints (joints)
        const constraints = [];
        
        // Neck joint (head to torso)
        constraints.push(Matter.Constraint.create({
            bodyA: head,
            bodyB: torso,
            pointA: { x: 0, y: 25 * scale },
            pointB: { x: 0, y: -35 * scale },
            stiffness: 0.7,
            render: { visible: true, lineWidth: 2, strokeStyle: '#ffffff' }
        }));
        
        // Shoulders
        constraints.push(Matter.Constraint.create({
            bodyA: torso,
            bodyB: leftUpperArm,
            pointA: { x: -20 * scale, y: -30 * scale },
            pointB: { x: 15 * scale, y: 0 },
            stiffness: 0.7,
            render: { visible: true, lineWidth: 2, strokeStyle: '#ffffff' }
        }));
        
        constraints.push(Matter.Constraint.create({
            bodyA: torso,
            bodyB: rightUpperArm,
            pointA: { x: 20 * scale, y: -30 * scale },
            pointB: { x: -15 * scale, y: 0 },
            stiffness: 0.7,
            render: { visible: true, lineWidth: 2, strokeStyle: '#ffffff' }
        }));
        
        // Elbows
        constraints.push(Matter.Constraint.create({
            bodyA: leftUpperArm,
            bodyB: leftLowerArm,
            pointA: { x: -15 * scale, y: 0 },
            pointB: { x: 15 * scale, y: 0 },
            stiffness: 0.7,
            render: { visible: true, lineWidth: 2, strokeStyle: '#ffffff' }
        }));
        
        constraints.push(Matter.Constraint.create({
            bodyA: rightUpperArm,
            bodyB: rightLowerArm,
            pointA: { x: 15 * scale, y: 0 },
            pointB: { x: -15 * scale, y: 0 },
            stiffness: 0.7,
            render: { visible: true, lineWidth: 2, strokeStyle: '#ffffff' }
        }));
        
        // Hips
        constraints.push(Matter.Constraint.create({
            bodyA: torso,
            bodyB: leftUpperLeg,
            pointA: { x: -15 * scale, y: 35 * scale },
            pointB: { x: 0, y: -20 * scale },
            stiffness: 0.7,
            render: { visible: true, lineWidth: 2, strokeStyle: '#ffffff' }
        }));
        
        constraints.push(Matter.Constraint.create({
            bodyA: torso,
            bodyB: rightUpperLeg,
            pointA: { x: 15 * scale, y: 35 * scale },
            pointB: { x: 0, y: -20 * scale },
            stiffness: 0.7,
            render: { visible: true, lineWidth: 2, strokeStyle: '#ffffff' }
        }));
        
        // Knees
        constraints.push(Matter.Constraint.create({
            bodyA: leftUpperLeg,
            bodyB: leftLowerLeg,
            pointA: { x: 0, y: 20 * scale },
            pointB: { x: 0, y: -20 * scale },
            stiffness: 0.7,
            render: { visible: true, lineWidth: 2, strokeStyle: '#ffffff' }
        }));
        
        constraints.push(Matter.Constraint.create({
            bodyA: rightUpperLeg,
            bodyB: rightLowerLeg,
            pointA: { x: 0, y: 20 * scale },
            pointB: { x: 0, y: -20 * scale },
            stiffness: 0.7,
            render: { visible: true, lineWidth: 2, strokeStyle: '#ffffff' }
        }));
        
        // Add all bodies and constraints to the world
        const allParts = [
            head, torso, 
            leftUpperArm, leftLowerArm, rightUpperArm, rightLowerArm,
            leftUpperLeg, leftLowerLeg, rightUpperLeg, rightLowerLeg
        ];
        
        Matter.World.add(world, [...allParts, ...constraints]);
        
        // Return all parts for reference
        return {
            parts: allParts,
            constraints: constraints
        };
    },
    
    // Create a simple stick figure (simplified ragdoll)
    createStickFigure: (x, y, world) => {
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        
        // Head
        const head = Matter.Bodies.circle(x, y - 40, 15, {
            render: { fillStyle: accentColor }
        });
        
        // Body
        const body = Matter.Bodies.rectangle(x, y, 5, 60, {
            render: { fillStyle: accentColor }
        });
        
        // Limbs
        const leftArm = Matter.Bodies.rectangle(x - 20, y - 15, 30, 5, {
            render: { fillStyle: accentColor }
        });
        
        const rightArm = Matter.Bodies.rectangle(x + 20, y - 15, 30, 5, {
            render: { fillStyle: accentColor }
        });
        
        const leftLeg = Matter.Bodies.rectangle(x - 15, y + 40, 5, 40, {
            render: { fillStyle: accentColor }
        });
        
        const rightLeg = Matter.Bodies.rectangle(x + 15, y + 40, 5, 40, {
            render: { fillStyle: accentColor }
        });
        
        // Joints
        const constraints = [
            // Neck
            Matter.Constraint.create({
                bodyA: head,
                bodyB: body,
                pointA: { x: 0, y: 15 },
                pointB: { x: 0, y: -30 },
                stiffness: 0.7,
                render: { visible: true, strokeStyle: '#ffffff' }
            }),
            
            // Arms
            Matter.Constraint.create({
                bodyA: body,
                bodyB: leftArm,
                pointA: { x: 0, y: -20 },
                pointB: { x: 15, y: 0 },
                stiffness: 0.7,
                render: { visible: true, strokeStyle: '#ffffff' }
            }),
            
            Matter.Constraint.create({
                bodyA: body,
                bodyB: rightArm,
                pointA: { x: 0, y: -20 },
                pointB: { x: -15, y: 0 },
                stiffness: 0.7,
                render: { visible: true, strokeStyle: '#ffffff' }
            }),
            
            // Legs
            Matter.Constraint.create({
                bodyA: body,
                bodyB: leftLeg,
                pointA: { x: 0, y: 30 },
                pointB: { x: 0, y: -20 },
                stiffness: 0.7,
                render: { visible: true, strokeStyle: '#ffffff' }
            }),
            
            Matter.Constraint.create({
                bodyA: body,
                bodyB: rightLeg,
                pointA: { x: 0, y: 30 },
                pointB: { x: 0, y: -20 },
                stiffness: 0.7,
                render: { visible: true, strokeStyle: '#ffffff' }
            })
        ];
        
        // Add all bodies and constraints to world
        const allParts = [head, body, leftArm, rightArm, leftLeg, rightLeg];
        Matter.World.add(world, [...allParts, ...constraints]);
        
        return {
            parts: allParts,
            constraints: constraints
        };
    }
};