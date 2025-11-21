let position = 0;
let images = ["image1.png", "image2.jpeg", "image3.jpg"];

const container = document.getElementById('image-container');
const currentImage = document.querySelector('.current-image');
const nextImage = document.querySelector('.next-image');
const revealCursor = document.querySelector('.reveal-cursor');

const revealSize = 200; // Size of the reveal circle
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Update next image preview
function updateNextImage() {
    const nextPosition = (position + 1) % images.length;
    nextImage.style.backgroundImage = `url('./public/${images[nextPosition]}')`;
}

// Mouse move handler
container.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update cursor position
    revealCursor.style.left = mouseX + 'px';
    revealCursor.style.top = mouseY + 'px';
    
    // Update clip-path to reveal next image at cursor position
    nextImage.style.clipPath = `circle(${revealSize / 2}px at ${mouseX}px ${mouseY}px)`;
});

// Hide cursor when mouse leaves container
container.addEventListener('mouseleave', () => {
    nextImage.style.clipPath = `circle(0px at ${mouseX}px ${mouseY}px)`;
    revealCursor.style.opacity = '0';
});

// Show cursor when mouse enters container
container.addEventListener('mouseenter', () => {
    revealCursor.style.opacity = '1';
});

// Click to change image
container.addEventListener('click', () => {
    // Calculate the maximum distance from cursor to any corner
    const maxDistance = Math.max(
        Math.hypot(mouseX, mouseY),
        Math.hypot(window.innerWidth - mouseX, mouseY),
        Math.hypot(mouseX, window.innerHeight - mouseY),
        Math.hypot(window.innerWidth - mouseX, window.innerHeight - mouseY)
    );
    
    // Add expanding class for slower transition
    nextImage.classList.add('expanding');
    
    // Expand the reveal circle to cover entire screen
    nextImage.style.clipPath = `circle(${maxDistance}px at ${mouseX}px ${mouseY}px)`;
    
    // After animation completes, swap images
    setTimeout(() => {
        position++;
        if(position === images.length) position = 0;
        
        // Update current image to what was revealed
        currentImage.style.backgroundImage = `url('./public/${images[position]}')`;
        
        // Update next image preview
        updateNextImage();
        
        // Remove expanding class and reset to fast transition
        nextImage.classList.remove('expanding');
        
        // Reset clip-path to small circle at cursor position
        nextImage.style.clipPath = `circle(${revealSize / 2}px at ${mouseX}px ${mouseY}px)`;
    }, 800); // Match the transition duration
});

// Initialize
updateNextImage();