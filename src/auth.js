export class Auth {
    constructor(particleSystem) {
        this.particleSystem = particleSystem;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const usernameInputs = document.querySelectorAll('.username-input');
        usernameInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleUsernameInput(e));
        });

        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => e.preventDefault());
        });

        window.switchForm = (type) => this.switchForm(type);
    }

    handleUsernameInput(e) {
        if (e.target.value.trim()) {
            this.particleSystem.transformToText(e.target.value);
        } else {
            const targetPositions = new Float32Array(this.particleSystem.particleCount * 3);
            for (let i = 0; i < this.particleSystem.particleCount; i++) {
                targetPositions[i * 3] = (Math.random() - 0.5) * 100;
                targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
                targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
            }

            gsap.to(this.particleSystem.particles.geometry.attributes.position.array, {
                endArray: targetPositions,
                duration: 2,
                ease: 'power2.inOut',
                onUpdate: () => {
                    this.particleSystem.particles.geometry.attributes.position.needsUpdate = true;
                }
            });
        }
    }

    switchForm(type) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authContainer = document.querySelector('.auth-container');
        
        // 先将容器设为半透明
        authContainer.style.opacity = '0.3';
        
        if (type === 'register') {
            loginForm.classList.remove('active');
            setTimeout(() => {
                registerForm.classList.add('active');
                // 恢复容器透明度
                authContainer.style.opacity = '1';
            }, 300);
        } else {
            registerForm.classList.remove('active');
            setTimeout(() => {
                loginForm.classList.add('active');
                // 恢复容器透明度
                authContainer.style.opacity = '1';
            }, 300);
        }
    }
}