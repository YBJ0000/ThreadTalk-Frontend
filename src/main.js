import { ParticleSystem } from './particles';
import { Auth } from './auth';

document.addEventListener('DOMContentLoaded', () => {
  const particleSystem = new ParticleSystem();
  const auth = new Auth(particleSystem);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    const usernameInputs = document.querySelectorAll('.username-input');
    const hasText = Array.from(usernameInputs).some(input => input.value.trim());

    if (!hasText) {
      particleSystem.animateVortex();
    }
    particleSystem.render();
  }

  // Handle window resize
  window.addEventListener('resize', () => particleSystem.handleResize());

  // Start animation
  animate();
});