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
    position++;
    if(position === images.length) position = 0;
    
    // Update current image
    currentImage.style.backgroundImage = `url('./public/${images[position]}')`;
    
    // Update next image preview
    updateNextImage();
    
    // Reset clip-path and reapply at current mouse position
    nextImage.style.clipPath = `circle(0px at ${mouseX}px ${mouseY}px)`;
    setTimeout(() => {
        nextImage.style.clipPath = `circle(${revealSize / 2}px at ${mouseX}px ${mouseY}px)`;
    }, 50);
});

// Initialize
updateNextImage();