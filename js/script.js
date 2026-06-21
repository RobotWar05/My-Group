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
    // Starfield & Background Animation Engine
    // ----------------------------------------------------
    const canvas = document.getElementById('space-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let isMobile = false;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        isMobile = width < 768;
    }

    // 1. Các vì sao trôi
    class Star {
        constructor() {
            this.x = Math.random() * width - width / 2;
            this.y = Math.random() * height - height / 2;
            this.z = Math.random() * width;
            this.radius = 1.5;
        }
        update() {
            this.z -= isMobile ? 1 : 3; // Bay cực chậm trên điện thoại
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

    // 2. Sao chổi siêu tốc
    class ShootingStar {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width * 1.5;
            this.y = -100;
            const speedBase = isMobile ? 10 : 20;
            this.speedX = -(Math.random() * speedBase + (isMobile ? 8 : 15));
            this.speedY = Math.random() * speedBase + (isMobile ? 8 : 15);
            this.opacity = 0;
            this.active = false;
            setTimeout(() => { this.active = true; }, Math.random() * 4000 + 1000);
        }
        update() {
            if (!this.active) return;
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity += 0.15;
            if (this.y > height + 200 || this.x < -200) {
                this.active = false;
                this.reset();
            }
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.speedX * 4, this.y - this.speedY * 4);
            ctx.lineWidth = 2;
            let grad = ctx.createLinearGradient(this.x, this.y, this.x - this.speedX * 4, this.y - this.speedY * 4);
            grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(this.opacity, 1)})`);
            grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
            ctx.strokeStyle = grad;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2.5, 0, Math.PI*2);
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00f0ff';
            ctx.fill();
            ctx.restore();
        }
    }

    // 3. Đa dạng Phi thuyền không gian
    class CyberDrone {
        constructor() {
            this.reset();
        }

        reset() {
            // Sửa lỗi: Đảm bảo spawnRadius nhỏ hơn kill bounds để tàu không bị biến mất ngay lập tức
            const spawnAngle = Math.random() * Math.PI * 2;
            const spawnRadius = Math.max(width, height) / 2 + 100;
            this.x = (width / 2) + Math.cos(spawnAngle) * spawnRadius;
            this.y = (height / 2) + Math.sin(spawnAngle) * spawnRadius;
            
            // Bay cực nhanh trên cả PC và Mobile
            const speedFactor = isMobile ? 1.5 : 1.0; 
            const speedMag = (Math.random() * 7 + 5) * speedFactor;
            
            // Bay hướng ngược lại góc spawn (bay xuyên qua tâm)
            const travelAngle = spawnAngle + Math.PI + (Math.random() - 0.5) * 0.8;
            this.speedX = Math.cos(travelAngle) * speedMag;
            this.speedY = Math.sin(travelAngle) * speedMag;
            this.angle = travelAngle;
            
            // Ưu tiên tàu bay to hơn chút trên cả PC và Mobile
            const baseScale = isMobile ? 0.5 : 0.8;
            this.scale = Math.random() * 0.4 + baseScale;
            this.particles = []; 
            this.shipType = Math.floor(Math.random() * 4); // 4 Kiểu tàu khác nhau
            
            this.active = false;
            setTimeout(() => { this.active = true; }, Math.random() * 4000);
            
            const colors = ['#00f0ff', '#bd00ff', '#ff003c', '#ffea00'];
            this.coreColor = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            if (!this.active) return;
            this.x += this.speedX;
            this.y += this.speedY;

            // Xả khói động cơ
            if (Math.random() > 0.1) {
                this.particles.push({
                    x: this.x - Math.cos(this.angle) * 35 * this.scale,
                    y: this.y - Math.sin(this.angle) * 35 * this.scale,
                    life: 1.0,
                    size: Math.random() * 5 + 2,
                    speedX: -this.speedX * 0.4 + (Math.random() - 0.5),
                    speedY: -this.speedY * 0.4 + (Math.random() - 0.5)
                });
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                let p = this.particles[i];
                p.x += p.speedX;
                p.y += p.speedY;
                p.life -= 0.05; 
                if (p.life <= 0) this.particles.splice(i, 1);
            }

            // Kill bounds đủ lớn để tàu có thể bay ra ngoài hẳn màn hình
            const bounds = Math.max(width, height) + 200;
            if (this.x < -bounds || this.x > width + bounds || this.y < -bounds || this.y > height + bounds) {
                this.active = false;
                this.reset();
            }
        }

        draw() {
            if (!this.active) return;

            // Vệt lửa
            ctx.globalCompositeOperation = 'screen';
            this.particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 240, 255, ${p.life})`;
                ctx.fill();
            });
            ctx.globalCompositeOperation = 'source-over';

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.scale(this.scale, this.scale);

            // Vẽ nhiều loại tàu khác nhau
            ctx.beginPath();
            if (this.shipType === 0) {
                // Tàu chiến đấu (Fighter)
                ctx.moveTo(40, 0); 
                ctx.lineTo(10, 8); 
                ctx.lineTo(-10, 25); 
                ctx.lineTo(-20, 25); 
                ctx.lineTo(-10, 8); 
                ctx.lineTo(-30, 12); 
                ctx.lineTo(-30, -12); 
                ctx.lineTo(-10, -8); 
                ctx.lineTo(-20, -25); 
                ctx.lineTo(-10, -25); 
                ctx.lineTo(10, -8); 
            } else if (this.shipType === 1) {
                // Tàu tiêm kích siêu tốc (Interceptor)
                ctx.moveTo(50, 0); 
                ctx.lineTo(-10, 5); 
                ctx.lineTo(-10, 20); 
                ctx.lineTo(-20, 20);
                ctx.lineTo(0, 5); 
                ctx.lineTo(-30, 8); 
                ctx.lineTo(-40, 0);
                ctx.lineTo(-30, -8);
                ctx.lineTo(0, -5);
                ctx.lineTo(-20, -20);
                ctx.lineTo(-10, -20);
                ctx.lineTo(-10, -5);
            } else if (this.shipType === 2) {
                // Tàu chở hàng (Cargo Cruiser)
                ctx.moveTo(30, 12);
                ctx.lineTo(-20, 18);
                ctx.lineTo(-30, 12);
                ctx.lineTo(-30, -12);
                ctx.lineTo(-20, -18);
                ctx.lineTo(30, -12);
                ctx.lineTo(45, -6);
                ctx.lineTo(45, 6);
            } else {
                // Tàu tàng hình (Stealth Bomber)
                ctx.moveTo(35, 0); 
                ctx.lineTo(-30, 30); 
                ctx.lineTo(-15, 0); 
                ctx.lineTo(-30, -30); 
            }
            ctx.closePath();
            
            ctx.fillStyle = 'rgba(10, 15, 30, 0.9)'; 
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = this.coreColor; 
            ctx.stroke();

            // Lõi tàu
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI*2);
            ctx.fillStyle = this.coreColor;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.coreColor;
            ctx.fill();

            ctx.restore();
        }
    }

    // 4. Các khối hình học không gian 3D quay chậm
    class TechGeometry {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = (Math.random() - 0.5) * width * 2;
            this.y = (Math.random() - 0.5) * height * 2;
            this.z = initial ? Math.random() * width + 100 : width + 500; 
            
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = (Math.random() - 0.5) * 2;
            this.speedZ = - (Math.random() * 5 + 2); // Lao nhanh hơn
            
            this.rotX = Math.random() * Math.PI * 2;
            this.rotY = Math.random() * Math.PI * 2;
            this.rotZ = Math.random() * Math.PI * 2;
            
            this.rotSpeedX = (Math.random() - 0.5) * 0.05;
            this.rotSpeedY = (Math.random() - 0.5) * 0.05;
            this.rotSpeedZ = (Math.random() - 0.5) * 0.05;

            // Nhỏ lại trên mobile
            const baseSize = isMobile ? 10 : 15;
            this.size = Math.random() * (isMobile ? 15 : 35) + baseSize;

            const shapes = ['cube', 'tetrahedron', 'octahedron', 'diamond'];
            this.shapeType = shapes[Math.floor(Math.random() * shapes.length)];
            this.vertices = this.generateVertices(this.shapeType);
            this.edges = this.generateEdges(this.shapeType);

            const colors = ['#00f0ff', '#bd00ff', '#ffffff', '#ff003c'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        generateVertices(type) {
            let v = [];
            if (type === 'cube') {
                for(let i=0; i<8; i++) v.push({x: (i&1?1:-1), y: (i&2?1:-1), z: (i&4?1:-1)});
            } else if (type === 'tetrahedron') {
                v.push({x:1, y:1, z:1}, {x:-1, y:-1, z:1}, {x:-1, y:1, z:-1}, {x:1, y:-1, z:-1});
            } else if (type === 'octahedron' || type === 'diamond') {
                v.push({x:1, y:0, z:0}, {x:-1, y:0, z:0}, {x:0, y:1, z:0}, {x:0, y:-1, z:0}, {x:0, y:0, z:1}, {x:0, y:0, z:-1});
                if(type === 'diamond') { v[2].y = 2; v[3].y = -2; } // Diamond is an elongated octahedron
            }
            return v;
        }

        generateEdges(type) {
            if (type === 'cube') return [[0,1], [1,3], [3,2], [2,0], [4,5], [5,7], [7,6], [6,4], [0,4], [1,5], [2,6], [3,7]];
            if (type === 'tetrahedron') return [[0,1], [1,2], [2,0], [0,3], [1,3], [2,3]];
            if (type === 'octahedron' || type === 'diamond') return [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[4,3],[3,5],[5,2]];
            return [];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.z += this.speedZ;

            this.rotX += this.rotSpeedX;
            this.rotY += this.rotSpeedY;
            this.rotZ += this.rotSpeedZ;

            if (this.z < 10) this.reset(false);
        }

        draw() {
            if (this.z < 10) return;

            let projected = [];
            for(let i=0; i<this.vertices.length; i++) {
                let v = this.vertices[i];
                let x = v.x * this.size; let y = v.y * this.size; let z = v.z * this.size;
                
                let y1 = y * Math.cos(this.rotX) - z * Math.sin(this.rotX);
                let z1 = y * Math.sin(this.rotX) + z * Math.cos(this.rotX);
                let x2 = x * Math.cos(this.rotY) + z1 * Math.sin(this.rotY);
                let z2 = -x * Math.sin(this.rotY) + z1 * Math.cos(this.rotY);
                let x3 = x2 * Math.cos(this.rotZ) - y1 * Math.sin(this.rotZ);
                let y3 = x2 * Math.sin(this.rotZ) + y1 * Math.cos(this.rotZ);

                x3 += this.x; y3 += this.y;
                let worldZ = Math.max(1, z2 + this.z);

                let projX = (x3 / worldZ) * width + width / 2;
                let projY = (y3 / worldZ) * height + height / 2;

                projected.push({x: projX, y: projY});
            }

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = Math.max(0, 1 - (this.z / (width + 200)));
            ctx.beginPath();
            for(let i=0; i<this.edges.length; i++) {
                let p1 = projected[this.edges[i][0]];
                let p2 = projected[this.edges[i][1]];
                if(p1 && p2) {
                    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
                }
            }
            ctx.stroke();
            
            ctx.fillStyle = '#fff';
            for(let i=0; i<projected.length; i++) {
                ctx.beginPath();
                ctx.arc(projected[i].x, projected[i].y, 2, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }

    // 5. Đa dạng Công thức Toán học/Vật lý trôi nổi múa lượn
    class FloatingMath {
        constructor() {
            this.reset(true);
        }
        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + 100;
            
            // Tốc độ cực chậm trên điện thoại
            const speedFactor = isMobile ? 0.2 : 1.0;
            this.speedY = -(Math.random() * 1.5 + 0.5) * speedFactor; 
            this.speedX = (Math.random() - 0.5) * 1.0 * speedFactor;
            this.time = Math.random() * 100; // Dùng cho múa lượn (Sine wave)
            
            const formulas = [
                'E = mc²',
                'F = m·a',
                '∇ × B = μ₀J + μ₀ε₀(∂E/∂t)',
                'iℏ(∂Ψ/∂t) = ĤΨ',
                '∫₀^∞ e^(-x²) dx = √(π)/2', // Tích phân phức tạp
                'd/dx (xⁿ) = n·xⁿ⁻¹',       // Đạo hàm
                '∂²u/∂t² = c² ∇²u',         // Phương trình sóng
                '∮ E·dA = Q/ε₀',           // Định luật Gauss
                'e^(iπ) + 1 = 0',           // Euler
                'lim(x→0) sin(x)/x = 1',    // Giới hạn
                'F = G(m₁m₂)/r²',           // Hấp dẫn
                'H(s) = ∫ f(t)e^(-st)dt',   // Biến đổi Laplace
                'S = k_B ln(W)',            // Entropy
                'ΔxΔp ≥ ℏ/2',               // Bất định Heisenberg
                'P = I²R'
            ];
            this.text = formulas[Math.floor(Math.random() * formulas.length)];
            
            // Nhỏ lại phù hợp khung hình trên điện thoại
            const baseFontSize = isMobile ? 8 : 12;
            this.fontSize = Math.random() * (isMobile ? 6 : 14) + baseFontSize; 
            
            this.opacity = 0;
            this.maxOpacity = Math.random() * 0.4 + 0.1; // Sáng hơn
            this.fadeIn = true;
            this.color = Math.random() > 0.5 ? '#00f0ff' : '#bd00ff';
        }
        update() {
            this.time += (isMobile ? 0.01 : 0.05); // Lượn chậm trên mobile
            // Di chuyển lượn sóng ngang (Sine)
            this.x += Math.sin(this.time) * 1.0 + this.speedX;
            this.y += this.speedY;

            if (this.fadeIn) {
                this.opacity += (isMobile ? 0.002 : 0.005);
                if (this.opacity >= this.maxOpacity) this.fadeIn = false;
            } else {
                if (this.y < 150) this.opacity -= (isMobile ? 0.002 : 0.005); // Fade out sớm hơn khi lên cao
            }

            if (this.y < -50 || (this.opacity <= 0 && !this.fadeIn)) {
                this.reset();
            }
        }
        draw() {
            ctx.save();
            ctx.font = `${this.fontSize}px 'JetBrains Mono', monospace`;
            ctx.fillStyle = this.color;
            ctx.globalAlpha = Math.max(0, this.opacity);
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fillText(this.text, this.x, this.y);
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }

    let drones = [];
    let geometries = []; 
    let shootingStars = [];
    let mathFormulas = [];

    function initElements() {
        // Cập nhật lại isMobile trước khi init
        resize();

        stars = [];
        const finalNumStars = isMobile ? 120 : 400; // Giảm bớt sao
        for (let i = 0; i < finalNumStars; i++) stars.push(new Star());
        
        drones = [];
        const numDrones = isMobile ? 5 : 7; // Tăng lên 5 tàu bay cực ngầu trên điện thoại
        for (let i = 0; i < numDrones; i++) drones.push(new CyberDrone()); // tàu đa hình

        shootingStars = [];
        const numSS = isMobile ? 1 : 4; // 1 sao chổi
        for (let i = 0; i < numSS; i++) shootingStars.push(new ShootingStar());

        geometries = [];
        const numGeo = isMobile ? 0 : 25; // ẨN TẤT CẢ hình 3D trên điện thoại
        for (let i = 0; i < numGeo; i++) geometries.push(new TechGeometry());

        mathFormulas = [];
        const numMath = isMobile ? 3 : 25; // CHỈ HIỂN THỊ 3 CÔNG THỨC siêu chậm trên mobile
        for (let i = 0; i < numMath; i++) mathFormulas.push(new FloatingMath()); 
    }

    function animate() {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(3, 5, 8, 0.4)'; 
        ctx.fillRect(0, 0, width, height);

        // Vẽ các yếu tố theo thứ tự xa -> gần
        stars.forEach(s => { s.update(); s.draw(); });
        mathFormulas.forEach(m => { m.update(); m.draw(); });
        geometries.forEach(g => { g.update(); g.draw(); });
        shootingStars.forEach(ss => { ss.update(); ss.draw(); });
        drones.forEach(d => { d.update(); d.draw(); });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    
    // Start
    resize();
    initElements();
    animate();
});
