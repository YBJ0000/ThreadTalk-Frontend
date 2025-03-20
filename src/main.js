import * as THREE from 'three';
import { gsap } from 'gsap';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera position
camera.position.z = 50;
camera.position.y = -13;

// Particle system
const particleCount = 40000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

// Initialize particles
for (let i = 0; i < particleCount; i++) {
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

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Text canvas for particle positioning
const textCanvas = document.createElement('canvas');
const textCtx = textCanvas.getContext('2d');
textCanvas.width = 2048;
textCanvas.height = 256;

function createTextTexture(text) {
  textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
  textCtx.fillStyle = '#000000';
  textCtx.fillRect(0, 0, textCanvas.width, textCanvas.height);
  textCtx.fillStyle = '#ffffff';
  textCtx.font = '120px Arial';
  textCtx.textAlign = 'center';
  textCtx.textBaseline = 'middle';
  textCtx.fillText(text, textCanvas.width / 2, textCanvas.height / 2);
  return textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height).data;
}

// Vortex animation
let time = 0;
function animateVortex() {
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const x = positions[i3];
    const y = positions[i3 + 1];
    const z = positions[i3 + 2];

    // Vortex effect
    const angle = Math.atan2(z, x) + 0.005;
    const radius = Math.sqrt(x * x + z * z);
    positions[i3] = radius * Math.cos(angle);
    positions[i3 + 2] = radius * Math.sin(angle);
    positions[i3 + 1] = y + Math.sin(time + radius * 0.03) * 0.2;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  time += 0.01;
}

// Transform particles to text
function transformToText(text) {
  const textData = createTextTexture(text);
  const targetPositions = new Float32Array(particleCount * 3);
  let particleIndex = 0;

  for (let i = 0; particleIndex < particleCount && i < textData.length; i += 4) {
    if (textData[i] > 128) {
      const x = ((i / 4) % textCanvas.width - textCanvas.width / 2) * 0.1;
      const y = (Math.floor((i / 4) / textCanvas.width) - textCanvas.height / 2) * 0.1;
      targetPositions[particleIndex * 3] = x;
      targetPositions[particleIndex * 3 + 1] = -y;
      targetPositions[particleIndex * 3 + 2] = 0;
      particleIndex++;
    }
  }

  // Fill remaining particles
  for (let i = particleIndex; i < particleCount; i++) {
    targetPositions[i * 3] = (Math.random() - 0.5) * 100;
    targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  }

  // Animate to new positions
  gsap.to(particles.geometry.attributes.position.array, {
    endArray: targetPositions,
    duration: 2,
    ease: 'power2.inOut',
    onUpdate: () => {
      particles.geometry.attributes.position.needsUpdate = true;
    }
  });
}

// 移除原有的文本输入处理代码
document.addEventListener('DOMContentLoaded', () => {
    const usernameInputs = document.querySelectorAll('.username-input');
    usernameInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            if (e.target.value.trim()) {
                transformToText(e.target.value);
            } else {
                // Reset particles to vortex state when text is cleared
                const targetPositions = new Float32Array(particleCount * 3);
                for (let i = 0; i < particleCount; i++) {
                    targetPositions[i * 3] = (Math.random() - 0.5) * 100;
                    targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
                    targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
                }

                gsap.to(particles.geometry.attributes.position.array, {
                    endArray: targetPositions,
                    duration: 2,
                    ease: 'power2.inOut',
                    onUpdate: () => {
                        particles.geometry.attributes.position.needsUpdate = true;
                    }
                });
            }
        });
    });

    // 添加表单切换功能
    window.switchForm = function(type) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (type === 'register') {
            loginForm.classList.remove('active');
            setTimeout(() => {
                registerForm.classList.add('active');
            }, 300);
        } else {
            registerForm.classList.remove('active');
            setTimeout(() => {
                loginForm.classList.add('active');
            }, 300);
        }
    };

    // 阻止表单默认提交行为
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    });
});

// 修改 animate 函数
function animate() {
    requestAnimationFrame(animate);
    const usernameInputs = document.querySelectorAll('.username-input');
    const hasText = Array.from(usernameInputs).some(input => input.value.trim());
    
    if (!hasText) {
        animateVortex();
    }
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();