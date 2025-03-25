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

    // 检查 URL 是否包含 thread 参数
    const urlParams = new URLSearchParams(window.location.search);
    const threadId = urlParams.get('thread');
    
    this.loadThreads().then(() => {
        // 如果 URL 中有 thread 参数，自动显示该帖子
        if (threadId) {
            this.showThreadDetail(parseInt(threadId));
        }
    });

    // 删除重复的事件监听器设置
    this.setupLogoutHandler();
    // 删除这行，因为相关功能已经在 setupEventListeners 中处理
    // this.setupNewThreadHandler();
    
    this.setupScene();
    this.setupParticles();
    this.setupEventListeners();
    this.loadThreads();
    this.showWelcomeAnimation();
    this.animate();
  }

  hideThreadDetail() {
    document.getElementById('threadDetail').classList.add('hidden');
    // 更新 URL 为基础路径
    window.history.pushState({}, '', '/dashboard.html');
}

  // 删除整个 setupNewThreadHandler 方法，因为这些功能已经在 setupEventListeners 中实现
  // setupNewThreadHandler() { ... }

  setupLogoutHandler() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
      });
    }
  }

  setupNewThreadHandler() {
    const newThreadBtn = document.getElementById('newThreadBtn');
    const cancelThreadBtn = document.getElementById('cancelThread');
    const submitThreadBtn = document.getElementById('submitThread');
    const newThreadModal = document.getElementById('newThreadModal');

    if (newThreadBtn) {
      newThreadBtn.addEventListener('click', () => {
        newThreadModal.classList.remove('hidden');
      });
    }

    if (cancelThreadBtn) {
      cancelThreadBtn.addEventListener('click', () => {
        newThreadModal.classList.add('hidden');
      });
    }

    if (submitThreadBtn) {
      submitThreadBtn.addEventListener('click', async () => {
        const title = document.getElementById('newThreadTitle').value;
        const content = document.getElementById('newThreadContent').value;
        const isPublic = document.getElementById('threadIsPublic').checked;
        
        if (!title || !content) {
          alert('Please fill in all fields');
          return;
        }
      
        try {
          await ApiService.createThread(this.token, title, isPublic, content);
          newThreadModal.classList.add('hidden');
          document.getElementById('newThreadTitle').value = '';
          document.getElementById('newThreadContent').value = '';
          this.loadThreads();
        } catch (error) {
          alert(error.message);
        }
      });
    }
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
    // 登出功能
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/';
    });

    // 新建帖子相关
    document.getElementById('newThreadBtn').addEventListener('click', () => {
      document.getElementById('newThreadModal').classList.remove('hidden');
    });

    document.getElementById('cancelThread').addEventListener('click', () => {
      document.getElementById('newThreadModal').classList.add('hidden');
    });

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

    // 评论相关
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

    // 编辑帖子相关
    document.getElementById('cancelEditThread').addEventListener('click', () => {
      document.getElementById('editThreadModal').classList.add('hidden');
    });

    document.getElementById('submitEditThread').addEventListener('click', async () => {
      try {
        const threadData = {
          id: this.currentThreadId,
          title: document.getElementById('editThreadTitle').value,
          content: document.getElementById('editThreadContent').value,
          isPublic: document.getElementById('editThreadIsPublic').checked,
          lock: document.getElementById('editThreadLock').checked
        };

        await ApiService.updateThread(this.token, threadData);
        document.getElementById('editThreadModal').classList.add('hidden');
        this.showThreadDetail(this.currentThreadId);
        this.loadThreads();
      } catch (error) {
        alert(error.message);
      }
    });

    // 将 dashboard 实例添加到 window 对象
    window.dashboard = this;
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
        this.currentThread = thread;
  
        const isLiked = thread.likes && thread.likes[this.userId];
        const isWatched = thread.watchees && thread.watchees[this.userId];

        // 更新 URL，但不刷新页面
        const newUrl = `/dashboard.html?thread=${threadId}`;
        window.history.pushState({ threadId }, '', newUrl);
  
        const threadDetail = document.getElementById('threadDetail');
        const threadContent = document.getElementById('threadContent');
        
        threadDetail.classList.remove('hidden');
        threadContent.innerHTML = `
          <div class="thread-detail-content">
            <div class="thread-header">
              <h2>${thread.title}</h2>
              <div class="thread-actions">
                <button class="action-btn like-btn ${isLiked ? 'active' : ''}" 
                  onclick="window.dashboard.toggleLike(${threadId})">
                  ${isLiked ? '❤️' : '🤍'}
                </button>
                <button class="action-btn watch-btn ${isWatched ? 'active' : ''}" 
                  onclick="window.dashboard.toggleWatch(${threadId})">
                  ${isWatched ? '👁️' : '👁️‍🗨️'}
                </button>
                ${thread.creatorId === parseInt(this.userId) ? `
                  <button class="auth-button edit-thread-btn" onclick="window.dashboard.showEditThreadModal()">Edit</button>
                  <button class="auth-button delete-thread-btn" onclick="window.dashboard.confirmDeleteThread()">Delete</button>
                ` : ''}
              </div>
            </div>
            <div class="thread-metadata">
              <span class="thread-date">${new Date(thread.createdAt).toLocaleDateString()}</span>
              ${thread.lock ? '<span class="thread-locked">🔒 Locked</span>' : ''}
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
  
  // 添加toggle方法
  async toggleLike(threadId) {
    try {
      const thread = this.currentThread;
      const isCurrentlyLiked = thread.likes && thread.likes[this.userId];
      const response = await ApiService.likeThread(this.token, threadId, !isCurrentlyLiked);
      
      // 更新当前线程的状态
      if (!isCurrentlyLiked) {
        if (!thread.likes) thread.likes = {};
        thread.likes[this.userId] = true;
      } else {
        delete thread.likes[this.userId];
      }
      
      // 更新UI
      const likeBtn = document.querySelector('.like-btn');
      if (likeBtn) {
        likeBtn.innerHTML = thread.likes[this.userId] ? '❤️' : '🤍';
        likeBtn.classList.toggle('active', thread.likes[this.userId]);
      }
    } catch (error) {
      alert(error.message);
    }
  }
  
  async toggleWatch(threadId) {
    try {
      const thread = this.currentThread;
      const isCurrentlyWatched = thread.watchees && thread.watchees[this.userId];
      const response = await ApiService.watchThread(this.token, threadId, !isCurrentlyWatched);
      
      // 更新当前线程的状态
      if (!isCurrentlyWatched) {
        if (!thread.watchees) thread.watchees = {};
        thread.watchees[this.userId] = true;
      } else {
        delete thread.watchees[this.userId];
      }
      
      // 更新UI
      const watchBtn = document.querySelector('.watch-btn');
      if (watchBtn) {
        watchBtn.innerHTML = thread.watchees[this.userId] ? '👁️' : '👁️‍🗨️';
        watchBtn.classList.toggle('active', thread.watchees[this.userId]);
      }
    } catch (error) {
      alert(error.message);
    }
  }
  
  // 添加删除确认方法
  confirmDeleteThread() {
      if (confirm('确定要删除这个帖子吗？此操作不可撤销。')) {
          this.deleteThread();
      }
  }
  
  // 添加删除帖子方法
  async deleteThread() {
      try {
          await ApiService.deleteThread(this.token, this.currentThreadId);
          this.hideThreadDetail(); // 使用 hideThreadDetail 方法来隐藏详情并更新 URL
          this.loadThreads(); // 刷新帖子列表
      } catch (error) {
          alert(error.message);
      }
  }
  
  // 添加显示编辑模态框的方法
  showEditThreadModal() {
      const thread = this.currentThread;
      document.getElementById('editThreadTitle').value = thread.title;
      document.getElementById('editThreadContent').value = thread.content;
      document.getElementById('editThreadIsPublic').checked = thread.isPublic;
      document.getElementById('editThreadLock').checked = thread.lock;
      document.getElementById('editThreadModal').classList.remove('hidden');
  }

  // 添加时间格式化函数
  formatTimeAgo(date) {
      const now = new Date();
      const commentDate = new Date(date);
      const diffInSeconds = Math.floor((now - commentDate) / 1000);
  
      if (diffInSeconds < 60) return "Just now";
  
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes} minute(s) ago`;
  
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hour(s) ago`;
  
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} day(s) ago`;
  
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} week(s) ago`;
  }
  
  // 修改加载评论的方法
  async loadComments(threadId) {
      try {
          const comments = await ApiService.getComments(this.token, threadId);
          const commentsList = document.getElementById('commentsList');
          commentsList.innerHTML = '';
  
          // 获取所有评论的用户信息
          const userProfiles = {};
          for (const comment of comments) {
              if (!userProfiles[comment.creatorId]) {
                  try {
                      userProfiles[comment.creatorId] = await ApiService.getUserProfile(this.token, comment.creatorId);
                  } catch (error) {
                      console.error('Error loading user profile:', error);
                      userProfiles[comment.creatorId] = { name: 'Unknown User' };
                  }
              }
          }
  
          // 构建评论树
          const commentTree = {};
          const rootComments = [];
          
          // 首先创建所有评论节点
          comments.forEach(comment => {
              comment.children = [];
              commentTree[comment.id] = comment;
          });
  
          // 然后建立父子关系
          comments.forEach(comment => {
              if (comment.parentCommentId) {
                  const parent = commentTree[comment.parentCommentId];
                  if (parent) {
                      parent.children.push(comment);
                  } else {
                      rootComments.push(comment); // 如果找不到父评论，作为根评论处理
                  }
              } else {
                  rootComments.push(comment);
              }
          });
  
          // 递归渲染评论的函数
          const renderComment = (comment, level = 0) => {
              const isLiked = comment.likes && comment.likes[this.userId];
              const likesCount = comment.likes ? Object.keys(comment.likes).length : 0;
              const userName = userProfiles[comment.creatorId]?.name || 'Unknown User';
              const maxNestLevel = 2; // 设置最大嵌套层级（从0开始计数）
              
              const commentElement = document.createElement('div');
              commentElement.className = 'comment-item';
              commentElement.style.marginLeft = `${level * 20}px`;
              
              commentElement.innerHTML = `
                  <div class="comment-content">
                      <div class="comment-header">
                          <span class="comment-user">${userName}</span>
                          <span class="comment-time">${this.formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p>${comment.content}</p>
                      <div class="comment-metadata">
                          <button class="like-comment-btn ${isLiked ? 'active' : ''}" id="like-comment-${comment.id}">
                              ${isLiked ? '❤️' : '🤍'} ${likesCount}
                          </button>
                          ${!this.currentThread.lock && level <= maxNestLevel ? `
                              <button class="reply-btn" onclick="window.dashboard.showReplyModal(${comment.id})">
                                  Reply
                              </button>
                          ` : ''}
                          ${comment.creatorId === parseInt(this.userId) ? `
                              <button class="delete-comment-btn" onclick="window.dashboard.deleteComment(${comment.id})">
                                  Delete
                              </button>
                          ` : ''}
                      </div>
                  </div>
              `;
              
              commentsList.appendChild(commentElement);
              
              // 添加点赞事件监听
              const likeBtn = document.getElementById(`like-comment-${comment.id}`);
              likeBtn.addEventListener('click', () => this.toggleCommentLike(comment.id));
              
              // 递归渲染所有子评论
              if (comment.children && comment.children.length > 0) {
                  comment.children
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .forEach(child => renderComment(child, level + 1));
              }
          };
  
          // 渲染根评论
          rootComments
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .forEach(comment => renderComment(comment));
  
      } catch (error) {
          alert(error.message);
      }
  }
  
  // 添加回复模态框显示方法
  showReplyModal(parentCommentId) {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'replyModal';
      modal.innerHTML = `
          <div class="modal-content">
              <h3>Reply to Comment</h3>
              <textarea id="replyContent" class="auth-input" placeholder="Write your reply..."></textarea>
              <div class="modal-buttons">
                  <button onclick="window.dashboard.cancelReply()" class="auth-button">Cancel</button>
                  <button onclick="window.dashboard.submitReply(${parentCommentId})" class="auth-button">Reply</button>
              </div>
          </div>
      `;
      document.body.appendChild(modal);
  }
  
  // 添加取消回复方法
  cancelReply() {
      const modal = document.getElementById('replyModal');
      if (modal) {
          modal.remove();
      }
  }
  
  // 添加提交回复方法
  async submitReply(parentCommentId) {
      const content = document.getElementById('replyContent').value;
      if (!content) return;
  
      try {
          await ApiService.createComment(this.token, this.currentThreadId, content, parentCommentId);
          this.cancelReply();
          this.loadComments(this.currentThreadId);
      } catch (error) {
          alert(error.message);
      }
  }

  async toggleCommentLike(commentId) {
    try {
      const likeBtn = document.getElementById(`like-comment-${commentId}`);
      const isCurrentlyLiked = likeBtn.classList.contains('active');
      
      // 先更新UI，提供即时反馈
      likeBtn.innerHTML = isCurrentlyLiked ? '🤍' : '❤️';
      likeBtn.classList.toggle('active');
      
      // 调用API
      await ApiService.likeComment(this.token, commentId, !isCurrentlyLiked);
    } catch (error) {
      // 如果API调用失败，恢复原来的状态
      const likeBtn = document.getElementById(`like-comment-${commentId}`);
      const isCurrentlyLiked = likeBtn.classList.contains('active');
      likeBtn.innerHTML = isCurrentlyLiked ? '❤️' : '🤍';
      likeBtn.classList.toggle('active');
      alert(error.message);
    }
  }

  async deleteComment(commentId) {
    try {
      if (confirm('确定要删除这条评论吗？')) {
        await ApiService.deleteComment(this.token, commentId);
        // 删除成功后重新加载评论列表
        this.loadComments(this.currentThreadId);
      }
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