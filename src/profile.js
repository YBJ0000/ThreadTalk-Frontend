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
            const userData = {
                name: document.getElementById('nameInput').value,
                email: document.getElementById('emailInput').value,
                password: document.getElementById('passwordInput').value,
                image: document.getElementById('profileImage').src
            };

            if (!userData.password) {
                delete userData.password;
            }

            try {
                await ApiService.updateUserProfile(this.token, userData);
                alert('Profile updated successfully!');
                document.getElementById('passwordInput').value = '';
            } catch (error) {
                alert(error.message);
            }
        });
    }

    async loadUserProfile() {
        try {
            const profile = await ApiService.getUserProfile(this.token, this.userId);
            
            document.getElementById('nameInput').value = profile.name || '';
            document.getElementById('emailInput').value = profile.email || '';
            document.getElementById('profileImage').src = profile.image || '';
            document.getElementById('profileName').textContent = profile.name || '';

            // 更新粒子文字
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