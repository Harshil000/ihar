let position = 0;
let images = [{img : "image1.png"} , {img : "image2.jpeg"} , {img : "image3.jpg"}];

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
    nextImage.style.backgroundImage = `url('./public/${images[nextPosition].img}')`;
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

// Hide cursor when mouse leaves container with cute shrinking animation
container.addEventListener('mouseleave', () => {
    if (!isAnimating) {
        // Gradually shrink the heart
        let shrinkSize = revealSize;
        const shrinkInterval = setInterval(() => {
            shrinkSize -= revealSize / 15;
            if (shrinkSize <= 0) {
                shrinkSize = 0;
                clearInterval(shrinkInterval);
            }
            nextImage.style.clipPath = getHeartClipPath(mouseX, mouseY, shrinkSize);
        }, 20);
    } else {
        nextImage.style.clipPath = getHeartClipPath(mouseX, mouseY, 0);
    }
    revealCursor.style.opacity = '0';
});

// Show cursor when mouse enters container with cute spawning animation
container.addEventListener('mouseenter', () => {
    revealCursor.style.opacity = '1';
    
    if (!isAnimating) {
        revealCursor.classList.add('spawning');
        nextImage.classList.add('spawning');
        
        // Gradually grow the heart from 0 to full size
        let growthSize = 0;
        const growthInterval = setInterval(() => {
            growthSize += revealSize / 20;
            if (growthSize >= revealSize) {
                growthSize = revealSize;
                clearInterval(growthInterval);
                nextImage.classList.remove('spawning');
                
                // Remove spawning animation after it completes
                setTimeout(() => {
                    revealCursor.classList.remove('spawning');
                }, 600);
            }
            nextImage.style.clipPath = getHeartClipPath(mouseX, mouseY, growthSize);
        }, 30);
    }
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
    
    // Use much larger scale to ensure heart covers entire screen including corners
    // Heart needs bigger scale than circle due to its shape
    nextImage.style.clipPath = getHeartClipPath(clickX, clickY, maxDistance * 4);
    
    // Wait longer to ensure full screen coverage before swapping
    setTimeout(() => {
        // First make next image cover everything with no clip
        nextImage.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
        
        // Then immediately swap the background images
        setTimeout(() => {
            position++;
            if(position === images.length) position = 0;
            
            // Update current image to what was revealed
            currentImage.style.backgroundImage = `url('./public/${images[position].img}')`;
            
            // Update next image preview
            updateNextImage();
            
            // Remove expanding class and disable all transitions
            nextImage.classList.remove('expanding');
            nextImage.style.transition = 'none';
            
            // Instantly reset clip-path to 0 (no transition)
            nextImage.style.clipPath = getHeartClipPath(mouseX, mouseY, 0);
            
            // Re-enable transition with spawning animation
            requestAnimationFrame(() => {
                nextImage.style.transition = '';
                nextImage.classList.add('spawning');
                revealCursor.classList.add('spawning');
                
                // Gradually grow the heart from 0 to full size
                let growthSize = 0;
                const growthInterval = setInterval(() => {
                    growthSize += revealSize / 20;
                    if (growthSize >= revealSize) {
                        growthSize = revealSize;
                        clearInterval(growthInterval);
                        isAnimating = false;
                        nextImage.classList.remove('spawning');
                        
                        // Remove spawning animation after it completes
                        setTimeout(() => {
                            revealCursor.classList.remove('spawning');
                        }, 600);
                    }
                    nextImage.style.clipPath = getHeartClipPath(mouseX, mouseY, growthSize);
                }, 30);
            });
        }, 50);
    }, 750); // Slightly before animation completes but after full coverage
});

// Initialize
updateNextImage();