import { gsap } from 'gsap';
import ApiService from './api';

export class Auth {
  constructor(particleSystem) {
    this.particleSystem = particleSystem;
    this.token = localStorage.getItem('token');
    this.userId = localStorage.getItem('userId');
    this.setupEventListeners();
  }

  setupEventListeners() {
    const usernameInputs = document.querySelectorAll('.username-input');
    usernameInputs.forEach(input => {
      input.addEventListener('input', (e) => this.handleUsernameInput(e));
    });

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;
      if (!email || !password) {
        alert('Please enter both email and password');
        return;
      }
      try {
        const response = await ApiService.login(email, password);
        this.token = response.token;
        this.userId = response.userId;
        localStorage.setItem('token', this.token);
        localStorage.setItem('userId', this.userId);
        window.location.href = '/dashboard';
      } catch (error) {
        alert(error.message);
      }
    });

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('registerUsername').value;
      const name = document.getElementById('registerName').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('registerConfirmPassword').value;

      if (!email || !name || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      try {
        const response = await ApiService.register(email, password, name);
        this.token = response.token;
        this.userId = response.userId;
        localStorage.setItem('token', this.token);
        localStorage.setItem('userId', this.userId);
        window.location.href = '/dashboard';
      } catch (error) {
        alert(error.message);
      }
    });

    window.switchForm = (type) => this.switchForm(type);
  }

  handleUsernameInput(e) {
    if (e.target.value.trim()) {
      this.particleSystem.transformToText(e.target.value);
    } else {
      // 使用一个专门的方法来重置粒子到漩涡状态
      this.resetParticles();
    }
  }

  resetParticles() {
    // 创建随机位置
    const targetPositions = new Float32Array(this.particleSystem.particleCount * 3);
    for (let i = 0; i < this.particleSystem.particleCount; i++) {
      targetPositions[i * 3] = (Math.random() - 0.5) * 100;
      targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    // 使用GSAP动画过渡到随机位置
    gsap.to(this.particleSystem.particles.geometry.attributes.position.array, {
      endArray: targetPositions,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.particleSystem.particles.geometry.attributes.position.needsUpdate = true;
      },
      onComplete: () => {
        // 确保动画完成后粒子系统知道应该显示漩涡
        const inputs = document.querySelectorAll('.username-input');
        const hasText = Array.from(inputs).some(input => input.value.trim());
        if (!hasText) {
          // 强制更新一次，确保回到漩涡状态
          this.particleSystem.animateVortex();
        }
      }
    });
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