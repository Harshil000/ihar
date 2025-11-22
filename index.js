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
    { poster: "./poster/poster1.jpg", songName: "Moonlight Serenade", audio: "./audio/audio1.m4a" },
    { poster: "./poster/poster2.png", songName: "Love in the Air", audio: "./audio/audio2.m4a" },
    { poster: "./poster/poster3.png", songName: "Hearts Collide", audio: "./audio/audio3.m4a" },
    { poster: "./poster/poster4.png", songName: "Dreamy Nights", audio: "./audio/audio4.m4a" },
    { poster: "./poster/poster5.png", songName: "Sunset Romance", audio: "./audio/audio5.m4a" },
    { poster: "./poster/poster6.png", songName: "Sweet Melody", audio: "./audio/audio6.m4a" },
    { poster: "./poster/poster7.png", songName: "Forever Yours", audio: "./audio/audio7.m4a" },
    { poster: "./poster/poster8.jpg", songName: "Starlight Kiss", audio: "./audio/audio8.m4a" },
    { poster: "./poster/poster9.jpg", songName: "Dancing in Rain", audio: "./audio/audio9.m4a" },
    { poster: "./poster/poster10.jpg", songName: "Endless Love", audio: "./audio/audio10.m4a" }
];

// Music Menu Elements
const musicDisc = document.getElementById('music-disc');
const songMenu = document.getElementById('song-menu');
const closeMenuBtn = document.getElementById('close-menu');
const songList = document.getElementById('song-list');
const audioPlayer = document.getElementById('audio-player');
const discPoster = document.getElementById('disc-poster');
const playPauseIcon = document.getElementById('play-pause-icon');
const miniPlayer = document.querySelector('.mini-player');
const miniPoster = document.getElementById('mini-poster');
const miniSongName = document.getElementById('mini-song-name');
let currentSongIndex = 0;
let isPlaying = false;

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
            e.stopPropagation();
            
            // Play selected song
            playSong(index);
            
            // Close menu
            songMenu.classList.remove('show');
            songMenu.classList.add('hidden');
        });
        
        songList.appendChild(songItem);
    });
}

// Open song menu on disc click
musicDisc.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Open menu
    songMenu.classList.remove('hidden');
    songMenu.classList.add('show');
});

// Open song menu on mini player click
miniPlayer.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Open menu
    songMenu.classList.remove('hidden');
    songMenu.classList.add('show');
});

closeMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    songMenu.classList.remove('show');
    songMenu.classList.add('hidden');
});

// Music Control Functions
function playSong(index) {
    currentSongIndex = index;
    const song = songs[index];
    
    audioPlayer.src = song.audio;
    discPoster.src = song.poster;
    miniPoster.src = song.poster;
    miniSongName.textContent = song.songName;
    
    audioPlayer.play().then(() => {
        isPlaying = true;
        updatePlayPauseIcons('⏸️');
        musicDisc.classList.add('playing');
    }).catch(err => {
        console.log('Playback prevented:', err);
        isPlaying = false;
        updatePlayPauseIcons('▶️');
        musicDisc.classList.remove('playing');
    });
    
    // Update active state in song list
    updateActiveSong();
}

function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        updatePlayPauseIcons('▶️');
        musicDisc.classList.remove('playing');
    } else {
        audioPlayer.play().then(() => {
            isPlaying = true;
            updatePlayPauseIcons('⏸️');
            musicDisc.classList.add('playing');
        }).catch(err => {
            console.log('Playback failed:', err);
        });
    }
}

function updatePlayPauseIcons(icon) {
    playPauseIcon.textContent = icon;
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
        playPauseBtn.textContent = icon;
    }
}

function playNextSong() {
    // Play next song in queue
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
}

function playPreviousSong() {
    // Play previous song
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
}

function updateActiveSong() {
    const allSongItems = document.querySelectorAll('.song-item');
    allSongItems.forEach((item, index) => {
        if (index === currentSongIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Auto-play next song when current ends
audioPlayer.addEventListener('ended', playNextSong);

// Control button event listeners
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

playPauseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlayPause();
});

prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playPreviousSong();
});

nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playNextSong();
});

// Initialize song list
populateSongList();

// Set random song as ready (will play on first user interaction)
const randomIndex = Math.floor(Math.random() * songs.length);
currentSongIndex = randomIndex;
audioPlayer.src = songs[randomIndex].audio;
discPoster.src = songs[randomIndex].poster;
miniPoster.src = songs[randomIndex].poster;
miniSongName.textContent = songs[randomIndex].songName;
updateActiveSong();

// Auto-play on first user interaction with the page
let hasStarted = false;
document.addEventListener('click', () => {
    if (!hasStarted && !isPlaying) {
        hasStarted = true;
        playSong(currentSongIndex);
    }
}, { once: true });

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