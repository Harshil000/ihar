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

// Update previous image preview
function updatePreviousImage() {
    const prevPosition = (position - 1 + images.length) % images.length;
    nextImage.style.backgroundImage = `url('./public/${images[prevPosition].img}')`;
}

// Mouse move handler
container.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Only update cursor if not animating
    if (!isAnimating) {
        const containerWidth = container.offsetWidth;
        const isLeftHalf = mouseX < containerWidth / 2;
        
        // Update cursor position
        revealCursor.style.left = mouseX + 'px';
        revealCursor.style.top = mouseY + 'px';
        
        // Show previous image on left half, next image on right half
        if (isLeftHalf) {
            updatePreviousImage();
        } else {
            updateNextImage();
        }
        
        // Update clip-path to reveal image at cursor position with heart shape
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
container.addEventListener('click', (e) => {
    if (isAnimating) return; // Prevent multiple clicks during animation
    
    isAnimating = true; // Lock cursor tracking
    
    const containerWidth = container.offsetWidth;
    const clickedX = e.clientX;
    const isLeftHalf = clickedX < containerWidth / 2;
    
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
    
    // Determine navigation direction based on click position
    const navigateForward = !isLeftHalf;
    
    // Set the appropriate image before expansion
    if (navigateForward) {
        updateNextImage();
    } else {
        updatePreviousImage();
    }
    
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
            // Navigate forward or backward
            if (navigateForward) {
                position++;
                if(position === images.length) position = 0;
            } else {
                position--;
                if(position < 0) position = images.length - 1;
            }
            
            // Update current image to what was revealed
            currentImage.style.backgroundImage = `url('./public/${images[position].img}')`;
            
            // Update preview based on current mouse position
            const currentIsLeftHalf = mouseX < containerWidth / 2;
            if (currentIsLeftHalf) {
                updatePreviousImage();
            } else {
                updateNextImage();
            }
            
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

// Songs Array
const songs = [
    { poster: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop", songName: "Moonlight Serenade" },
    { poster: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop", songName: "Love in the Air" },
    { poster: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop", songName: "Hearts Collide" },
    { poster: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=200&h=200&fit=crop", songName: "Dreamy Nights" },
    { poster: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop", songName: "Sunset Romance" },
    { poster: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop", songName: "Sweet Melody" },
    { poster: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop", songName: "Forever Yours" },
    { poster: "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=200&h=200&fit=crop", songName: "Starlight Kiss" },
    { poster: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=200&h=200&fit=crop", songName: "Dancing in Rain" },
    { poster: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&h=200&fit=crop", songName: "Endless Love" }
];

// Music Menu Elements
const musicDisc = document.getElementById('music-disc');
const songMenu = document.getElementById('song-menu');
const closeMenuBtn = document.getElementById('close-menu');
const songList = document.getElementById('song-list');

// Populate song list
function populateSongList() {
    songList.innerHTML = '';
    songs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.innerHTML = `
            <img src="${song.poster}" alt="${song.songName}" class="song-poster">
            <div class="song-name">${song.songName}</div>
        `;
        
        songItem.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from reaching image-container
            console.log(`Selected: ${song.songName}`);
            // Add your song play logic here
            songMenu.classList.remove('show');
            songMenu.classList.add('hidden');
            setTimeout(() => {
                musicDisc.classList.remove('menu-open');
            }, 600);
        });
        
        songList.appendChild(songItem);
    });
}

// Toggle song menu
musicDisc.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event from reaching image-container
    songMenu.classList.remove('hidden');
    songMenu.classList.add('show');
    musicDisc.classList.add('menu-open');
});

closeMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    songMenu.classList.remove('show');
    songMenu.classList.add('hidden');
    setTimeout(() => {
        musicDisc.classList.remove('menu-open');
    }, 600);
});

// Initialize song list
populateSongList();

// Romantic Overlay Logic
const overlay = document.getElementById('romantic-overlay');
const dateInput = document.getElementById('date-input');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');
const correctDate = '07/04/2025';

// Format date input automatically
dateInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
        value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }
    e.target.value = value;
});

// Handle Enter key
dateInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        validateDate();
    }
});

// Validate date
function validateDate() {
    const enteredDate = dateInput.value.trim();
    
    if (enteredDate === correctDate) {
        errorMessage.style.color = '#32cd32';
        errorMessage.textContent = '✨ Perfect! Unlocking our memories... 💕';
        
        setTimeout(() => {
            overlay.classList.add('hidden');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 1000);
        }, 1500);
    } else if (enteredDate === '') {
        errorMessage.style.color = '#ff1493';
        errorMessage.textContent = 'Please enter a date ❤️';
    } else {
        errorMessage.style.color = '#ff1493';
        errorMessage.textContent = '💔 Oops! That\'s not the right date. Try again!';
        dateInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            dateInput.style.animation = '';
        }, 500);
    }
}

submitBtn.addEventListener('click', validateDate);