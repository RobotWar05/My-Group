document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // Modal Logic
    // ----------------------------------------------------
    const modal = document.getElementById('tech-modal');
    const modalContentBody = document.getElementById('modal-content-body');
    const closeBtn = document.querySelector('.modal-close');
    const overlay = document.querySelector('.modal-overlay');
    const techBoxes = document.querySelectorAll('.tech-box');

    function openModal(dataHtml) {
        modalContentBody.innerHTML = dataHtml;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    techBoxes.forEach(box => {
        box.addEventListener('click', () => {
            const dataElement = box.querySelector('.role-modal-data');
            if (dataElement) {
                openModal(dataElement.innerHTML);
            }
        });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // ----------------------------------------------------
    // Starfield & Spaceship Canvas Animation
    // ----------------------------------------------------
    const canvas = document.getElementById('space-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let stars = [];
    const numStars = 300; // Increased star count
    
    let spaceships = [];

    // Preload spaceship image
    const shipImg = new Image();
    shipImg.src = './assets/spaceship.png';

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Star {
        constructor() {
            this.x = Math.random() * width - width / 2;
            this.y = Math.random() * height - height / 2;
            this.z = Math.random() * width;
            this.radius = 1.5;
        }

        update() {
            this.z -= 2; 
            if (this.z <= 0) {
                this.x = Math.random() * width - width / 2;
                this.y = Math.random() * height - height / 2;
                this.z = width;
            }
        }

        draw() {
            let x = (this.x / this.z) * width + width / 2;
            let y = (this.y / this.z) * height + height / 2;
            let radius = this.radius * (width / this.z);

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - this.z / width})`;
            ctx.fill();
        }
    }

    // Flying Spaceship
    class Spaceship {
        constructor() {
            this.reset();
        }

        reset() {
            this.isLeftToRight = Math.random() > 0.5;
            this.x = this.isLeftToRight ? -200 : width + 200;
            this.y = Math.random() * height;
            
            // Random speed
            this.speedX = (Math.random() * 4 + 2) * (this.isLeftToRight ? 1 : -1);
            this.speedY = (Math.random() - 0.5) * 1.5;
            
            // Random size variation
            this.scale = Math.random() * 0.5 + 0.3; // 30% to 80% size
            
            this.active = false;
            // random delay before spawning
            setTimeout(() => { this.active = true; }, Math.random() * 8000);
        }

        update() {
            if (!this.active) return;
            this.x += this.speedX;
            this.y += this.speedY;

            // Reset if goes off screen far enough
            if (this.x < -300 || this.x > width + 300 || this.y < -300 || this.y > height + 300) {
                this.active = false;
                this.reset();
            }
        }

        draw() {
            if (!this.active || !shipImg.complete) return;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Calculate rotation based on trajectory
            const angle = Math.atan2(this.speedY, this.speedX);
            // Assuming the source image faces right, if it faces up or something, adjust angle
            ctx.rotate(angle);
            
            // Optional: add a glowing effect (screen blend mode)
            ctx.globalCompositeOperation = 'screen';
            
            // Draw image centered
            const drawWidth = shipImg.width * this.scale;
            const drawHeight = shipImg.height * this.scale;
            ctx.drawImage(shipImg, -drawWidth/2, -drawHeight/2, drawWidth, drawHeight);
            
            ctx.restore();
        }
    }

    function initElements() {
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push(new Star());
        }
        
        spaceships = [];
        for (let i = 0; i < 5; i++) { // 5 spaceships concurrently on screen
            spaceships.push(new Spaceship());
        }
    }

    function animate() {
        // Deep space background with slight trail
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(3, 5, 8, 0.4)'; 
        ctx.fillRect(0, 0, width, height);

        stars.forEach(star => {
            star.update();
            star.draw();
        });
        
        spaceships.forEach(ship => {
            ship.update();
            ship.draw();
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    
    // Start
    resize();
    initElements();
    animate();
});
