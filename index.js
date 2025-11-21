let position = 0;
let images = ["image1.png", "image2.jpeg", "image3.jpg"];

const container = document.getElementById('image-container');
const currentImage = document.querySelector('.current-image');
const nextImage = document.querySelector('.next-image');
const revealCursor = document.querySelector('.reveal-cursor');

const revealSize = 200; // Size of the reveal heart
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isAnimating = false; // Lock flag to prevent cursor tracking during animation

// Helper function to create heart-shaped clip-path
function getHeartClipPath(centerX, centerY, size) {
    if (size === 0) return 'polygon(50% 50%, 50% 50%, 50% 50%)';
    
    const points = [];
    const scale = size / 100;
    
    // Heart shape coordinates (relative to center)
    const heartCoords = [
        [0, -30], [11, -37], [20, -40], [30, -37], [38, -30],
        [43, -20], [43, -10], [40, 0],
        [35, 10], [28, 20], [20, 30],
        [10, 40], [0, 50],
        [-10, 40], [-20, 30], [-28, 20],
        [-35, 10], [-40, 0], [-43, -10],
        [-43, -20], [-38, -30], [-30, -37],
        [-20, -40], [-11, -37], [0, -30]
    ];
    
    // Convert to absolute coordinates
    heartCoords.forEach(([x, y]) => {
        const absX = centerX + (x * scale);
        const absY = centerY + (y * scale);
        points.push(`${absX}px ${absY}px`);
    });
    
    return `polygon(${points.join(', ')})`;
}

// Update next image preview
function updateNextImage() {
    const nextPosition = (position + 1) % images.length;
    nextImage.style.backgroundImage = `url('./public/${images[nextPosition]}')`;
}

// Mouse move handler
container.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Only update cursor if not animating
    if (!isAnimating) {
        // Update cursor position
        revealCursor.style.left = mouseX + 'px';
        revealCursor.style.top = mouseY + 'px';
        
        // Update clip-path to reveal next image at cursor position with heart shape
        nextImage.style.clipPath = getHeartClipPath(mouseX, mouseY, revealSize);
    }
});

// Hide cursor when mouse leaves container
container.addEventListener('mouseleave', () => {
    nextImage.style.clipPath = getHeartClipPath(mouseX, mouseY, 0);
    revealCursor.style.opacity = '0';
});

// Show cursor when mouse enters container
container.addEventListener('mouseenter', () => {
    revealCursor.style.opacity = '1';
});

// Click to change image
container.addEventListener('click', () => {
    if (isAnimating) return; // Prevent multiple clicks during animation
    
    isAnimating = true; // Lock cursor tracking
    
    // Calculate the maximum distance from cursor to any corner
    const maxDistance = Math.max(
        Math.hypot(mouseX, mouseY),
        Math.hypot(window.innerWidth - mouseX, mouseY),
        Math.hypot(mouseX, window.innerHeight - mouseY),
        Math.hypot(window.innerWidth - mouseX, window.innerHeight - mouseY)
    );
    
    // Store the click position
    const clickX = mouseX;
    const clickY = mouseY;
    
    // Add expanding class for slower transition
    nextImage.classList.add('expanding');
    
    // Expand the reveal heart to cover entire screen
    nextImage.style.clipPath = getHeartClipPath(clickX, clickY, maxDistance * 2.5);
    
    // After animation completes, swap images
    setTimeout(() => {
        position++;
        if(position === images.length) position = 0;
        
        // Update current image to what was revealed
        currentImage.style.backgroundImage = `url('./public/${images[position]}')`;
        
        // Update next image preview
        updateNextImage();
        
        // Remove expanding class and disable all transitions
        nextImage.classList.remove('expanding');
        nextImage.style.transition = 'none';
        
        // Instantly reset clip-path to 0 (no transition)
        nextImage.style.clipPath = getHeartClipPath(mouseX, mouseY, 0);
        
        // Re-enable transition and show at current position
        requestAnimationFrame(() => {
            nextImage.style.transition = '';
            isAnimating = false;
            nextImage.style.clipPath = getHeartClipPath(mouseX, mouseY, revealSize);
        });
    }, 800); // Match the transition duration
});

// Initialize
updateNextImage();