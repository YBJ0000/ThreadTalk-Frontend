import * as THREE from 'three';
import { gsap } from 'gsap';
import ApiService from './api';

class Dashboard {
  constructor() {
    this.token = localStorage.getItem('token');
    this.userId = localStorage.getItem('userId');
    if (!this.token || !this.userId) {
      window.location.href = '/';
      return;
    }

    this.setupScene();
    this.setupParticles();
    this.setupEventListeners();
    this.loadThreads();
    
    // 获取用户信息并显示欢迎动画
    this.showWelcomeAnimation();
    
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.insertBefore(this.renderer.domElement, document.body.firstChild);

    this.camera.position.z = 50;
    this.camera.position.y = -13;

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupParticles() {
    const particleCount = 40000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

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

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/';
    });

    document.getElementById('newThreadBtn').addEventListener('click', () => {
      document.getElementById('newThreadModal').classList.remove('hidden');
    });

    document.getElementById('cancelThread').addEventListener('click', () => {
      document.getElementById('newThreadModal').classList.add('hidden');
    });

    // 在 setupEventListeners 方法中
    document.getElementById('submitThread').addEventListener('click', async () => {
      const title = document.getElementById('newThreadTitle').value;
      const content = document.getElementById('newThreadContent').value;
      const isPublic = document.getElementById('threadIsPublic').checked;
      
      if (!title || !content) {
        alert('Please fill in all fields');
        return;
      }
    
      try {
        await ApiService.createThread(this.token, title, isPublic, content);
        document.getElementById('newThreadModal').classList.add('hidden');
        document.getElementById('newThreadTitle').value = '';
        document.getElementById('newThreadContent').value = '';
        this.loadThreads();
      } catch (error) {
        alert(error.message);
      }
    });

    document.getElementById('submitComment').addEventListener('click', async () => {
      const content = document.getElementById('newComment').value;
      const threadId = this.currentThreadId;
      if (!content || !threadId) return;

      try {
        await ApiService.createComment(this.token, threadId, content);
        document.getElementById('newComment').value = '';
        this.loadComments(threadId);
      } catch (error) {
        alert(error.message);
      }
    });
  }

  async loadThreads() {
    try {
      const threads = await ApiService.getThreads(this.token);
      const threadsList = document.getElementById('threadsList');
      threadsList.innerHTML = '';

      threads.forEach(threadId => {
        const threadElement = document.createElement('div');
        threadElement.className = 'thread-item';
        threadElement.dataset.threadId = threadId;
        
        ApiService.getThread(this.token, threadId)
          .then(threadDetail => {
            threadElement.innerHTML = `
              <h3>${threadDetail.title || 'Untitled'}</h3>
            `;
          })
          .catch(error => {
            threadElement.innerHTML = `<p>Error loading thread</p>`;
            console.error('Error loading thread:', error);
          });

        threadElement.addEventListener('click', () => this.showThreadDetail(threadId));
        threadsList.appendChild(threadElement);
      });
    } catch (error) {
      alert(error.message);
    }
}

  async showThreadDetail(threadId) {
    try {
      const thread = await ApiService.getThread(this.token, threadId);
      this.currentThreadId = threadId;

      const threadDetail = document.getElementById('threadDetail');
      const threadContent = document.getElementById('threadContent');
      
      threadDetail.classList.remove('hidden');
      threadContent.innerHTML = `
        <div class="thread-detail-content">
          <h2>${thread.title}</h2>
          <div class="thread-metadata">
            <span class="thread-date">${new Date(thread.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="thread-body">
            ${thread.content}
          </div>
        </div>
      `;

      this.loadComments(threadId);
    } catch (error) {
      alert(error.message);
    }
}

  async loadComments(threadId) {
    try {
      const comments = await ApiService.getComments(this.token, threadId);
      const commentsList = document.getElementById('commentsList');
      commentsList.innerHTML = '';

      comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment-item';
        commentElement.innerHTML = `
                    <p>${comment.content}</p>
                    ${comment.userId === this.userId ? `
                        <button class="auth-button" onclick="deleteComment('${comment.id}')">Delete</button>
                    ` : ''}
                `;
        commentsList.appendChild(commentElement);
      });
    } catch (error) {
      alert(error.message);
    }
  }

  async deleteComment(commentId) {
    try {
      await ApiService.deleteComment(this.token, commentId);
      this.loadComments(this.currentThreadId);
    } catch (error) {
      alert(error.message);
    }
  }

  async showWelcomeAnimation() {
    try {
        const profile = await ApiService.getUserProfile(this.token, this.userId);
        if (profile.name) {
            // 显示欢迎文字
            const welcomeText = `Welcome, ${profile.name}!`;
            const positions = this.particles.geometry.attributes.position.array;
            
            // 先转换成欢迎文字
            this.transformToText(welcomeText);
            
            // 5秒后恢复漩涡效果
            setTimeout(() => {
                // 使用GSAP创建平滑过渡
                const targetPositions = new Float32Array(positions.length);
                for (let i = 0; i < positions.length; i += 3) {
                    targetPositions[i] = (Math.random() - 0.5) * 100;
                    targetPositions[i + 1] = (Math.random() - 0.5) * 100;
                    targetPositions[i + 2] = (Math.random() - 0.5) * 100;
                }
                
                gsap.to(positions, {
                    endArray: targetPositions,
                    duration: 2,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        this.particles.geometry.attributes.position.needsUpdate = true;
                    }
                });
            }, 3000);
        }
    } catch (error) {
        console.error('Error loading welcome animation:', error);
    }
}

  // 添加文字转换方法（从 ParticleSystem 类复制过来）
  transformToText(text) {
      // 创建临时 canvas 用于渲染文字
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 2048;
      canvas.height = 256;
  
      // 设置文字样式并渲染
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
      // 获取像素数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const positions = this.particles.geometry.attributes.position.array;
      let particleIndex = 0;
  
      // 根据文字像素重新排列粒子
      for (let i = 0; particleIndex < positions.length / 3 && i < imageData.length; i += 4) {
          if (imageData[i] > 128) {
              const x = ((i / 4) % canvas.width - canvas.width / 2) * 0.1;
              const y = (Math.floor((i / 4) / canvas.width) - canvas.height / 2) * 0.1;
              
              gsap.to(positions, {
                  duration: 2,
                  ease: "power2.inOut",
                  [particleIndex * 3]: x,
                  [particleIndex * 3 + 1]: -y,
                  [particleIndex * 3 + 2]: 0,
                  onUpdate: () => {
                      this.particles.geometry.attributes.position.needsUpdate = true;
                  }
              });
              
              particleIndex++;
          }
      }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      const angle = Math.atan2(z, x) + 0.005;
      const radius = Math.sqrt(x * x + z * z);
      positions[i] = radius * Math.cos(angle);
      positions[i + 2] = radius * Math.sin(angle);
      positions[i + 1] += Math.sin(Date.now() * 0.001 + radius * 0.03) * 0.02;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }
}

window.hideThreadDetail = () => {
  document.getElementById('threadDetail').classList.add('hidden');
};

window.deleteComment = async (commentId) => {
  if (window.dashboard) {
    await window.dashboard.deleteComment(commentId);
  }
};

window.dashboard = new Dashboard();