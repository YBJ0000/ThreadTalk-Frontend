import * as THREE from 'three';
import { gsap } from 'gsap';

export class ParticleSystem {
    constructor() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Camera position
        this.camera.position.z = 50;
        this.camera.position.y = -13;

        // Particle system setup
        this.particleCount = 40000;
        this.time = 0;
        this.setupParticles();
        this.setupTextCanvas();
    }

    setupParticles() {
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);

        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random();
            colors[i * 3 + 2] = Math.random();
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.7
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    setupTextCanvas() {
        this.textCanvas = document.createElement('canvas');
        this.textCtx = this.textCanvas.getContext('2d');
        this.textCanvas.width = 2048;
        this.textCanvas.height = 256;
    }

    createTextTexture(text) {
        this.textCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
        this.textCtx.fillStyle = '#000000';
        this.textCtx.fillRect(0, 0, this.textCanvas.width, this.textCanvas.height);
        this.textCtx.fillStyle = '#ffffff';
        this.textCtx.font = '120px Arial';
        this.textCtx.textAlign = 'center';
        this.textCtx.textBaseline = 'middle';
        this.textCtx.fillText(text, this.textCanvas.width / 2, this.textCanvas.height / 2);
        return this.textCtx.getImageData(0, 0, this.textCanvas.width, this.textCanvas.height).data;
    }

    animateVortex() {
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const x = positions[i3];
            const y = positions[i3 + 1];
            const z = positions[i3 + 2];

            const angle = Math.atan2(z, x) + 0.005;
            const radius = Math.sqrt(x * x + z * z);
            positions[i3] = radius * Math.cos(angle);
            positions[i3 + 2] = radius * Math.sin(angle);
            positions[i3 + 1] = y + Math.sin(this.time + radius * 0.03) * 0.2;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.time += 0.01;
    }

    transformToText(text) {
        const textData = this.createTextTexture(text);
        const targetPositions = new Float32Array(this.particleCount * 3);
        let particleIndex = 0;

        for (let i = 0; particleIndex < this.particleCount && i < textData.length; i += 4) {
            if (textData[i] > 128) {
                const x = ((i / 4) % this.textCanvas.width - this.textCanvas.width / 2) * 0.1;
                const y = (Math.floor((i / 4) / this.textCanvas.width) - this.textCanvas.height / 2) * 0.1;
                targetPositions[particleIndex * 3] = x;
                targetPositions[particleIndex * 3 + 1] = -y;
                targetPositions[particleIndex * 3 + 2] = 0;
                particleIndex++;
            }
        }

        for (let i = particleIndex; i < this.particleCount; i++) {
            targetPositions[i * 3] = (Math.random() - 0.5) * 100;
            targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }

        gsap.to(this.particles.geometry.attributes.position.array, {
            endArray: targetPositions,
            duration: 2,
            ease: 'power2.inOut',
            onUpdate: () => {
                this.particles.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}