import ApiService from './api';
import { ParticleSystem } from './particles';

class Profile {
    constructor() {
        this.token = localStorage.getItem('token');
        this.userId = localStorage.getItem('userId');
        if (!this.token || !this.userId) {
            window.location.href = '/';
            return;
        }

        this.particleSystem = new ParticleSystem();
        this.setupEventListeners();
        this.loadUserProfile();
        this.animate();
    }

    setupEventListeners() {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/';
        });

        document.getElementById('changeImageBtn').addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });

        document.getElementById('imageInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('profileImage').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('saveProfileBtn').addEventListener('click', async () => {
            const userData = {};
            
            // 只包含已修改的字段
            const nameInput = document.getElementById('nameInput');
            const emailInput = document.getElementById('emailInput');
            const passwordInput = document.getElementById('passwordInput');
            const profileImage = document.getElementById('profileImage');
            
            if (nameInput.value !== this.originalProfile.name) {
                userData.name = nameInput.value;
            }
            
            if (emailInput.value !== this.originalProfile.email) {
                userData.email = emailInput.value;
            }
            
            if (passwordInput.value) {
                userData.password = passwordInput.value;
            }
            
            if (profileImage.src !== this.originalProfile.image) {
                userData.image = profileImage.src;
            }

            // 如果没有任何修改，直接返回
            if (Object.keys(userData).length === 0) {
                alert('没有检测到任何修改');
                return;
            }

            try {
                await ApiService.updateUserProfile(this.token, userData);
                alert('个人资料更新成功！');
                document.getElementById('passwordInput').value = '';
                // 更新原始数据
                this.loadUserProfile();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    async loadUserProfile() {
        try {
            const profile = await ApiService.getUserProfile(this.token, this.userId);
            
            // 保存原始数据用于比较
            this.originalProfile = {
                name: profile.name || '',
                email: profile.email || '',
                image: profile.image || ''
            };
            
            document.getElementById('nameInput').value = this.originalProfile.name;
            document.getElementById('emailInput').value = this.originalProfile.email;
            document.getElementById('profileImage').src = this.originalProfile.image;
            document.getElementById('profileName').textContent = this.originalProfile.name;

            if (profile.name) {
                this.particleSystem.transformToText(profile.name);
            }

            this.loadWatchingThreads(profile.threadsWatching || []);
        } catch (error) {
            alert(error.message);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.particleSystem.render();
    }

    async loadWatchingThreads(threadIds) {
        const watchingList = document.getElementById('watchingList');
        watchingList.innerHTML = '';

        for (const threadId of threadIds) {
            try {
                const thread = await ApiService.getThread(this.token, threadId);
                const threadElement = document.createElement('div');
                threadElement.className = 'thread-card';
                threadElement.innerHTML = `
                    <h4>${thread.title}</h4>
                    <p>${thread.content.substring(0, 100)}${thread.content.length > 100 ? '...' : ''}</p>
                `;
                threadElement.addEventListener('click', () => {
                    window.location.href = `/dashboard.html?thread=${threadId}`;
                });
                watchingList.appendChild(threadElement);
            } catch (error) {
                console.error('Error loading thread:', error);
            }
        }
    }
}

window.profile = new Profile();