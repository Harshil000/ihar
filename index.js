let position = 0;
let images = [
    {img : "image1.jpg"},
    {img : "image2.jpg"},
    {img : "image3.jpg"},
    {img : "image4.jpg"},
    {img : "image5.jpg"},
    {img : "image6.jpg"},
    {img : "image7.jpg"},
    {img : "video1.mp4"},
    {img : "image8.jpg"},
    {img : "image9.jpg"},
    {img : "image10.jpg"},
    {img : "image11.jpg"},
    {img : "image12.jpg"},
    {img : "video2.mp4"},
    {img : "image13.jpg"},
    {img : "image14.jpg"},
    {img : "image15.jpg"},
    {img : "image16.jpg"},
    {img : "image17.jpg"},
    {img : "image18.jpg"},
    {img : "video3.mp4"},
    {img : "image19.jpg"},
    {img : "image20.jpg"},
    {img : "image21.jpg"},
    {img : "image22.jpg"},
    {img : "image23.jpg"},
    {img : "image24.jpg"},
    {img : "image25.jpg"},
    {img : "video4.mp4"},
    {img : "image26.jpg"},
    {img : "image27.jpg"},
    {img : "image28.jpg"},
    {img : "image29.jpg"},
    {img : "image30.jpg"},
    {img : "image31.jpg"},
    {img : "video5.mp4"},
    {img : "image32.jpg"},
    {img : "image33.jpg"},
    {img : "image34.jpg"},
    {img : "image35.jpg"},
    {img : "image36.jpg"},
    {img : "image37.jpg"},
    {img : "image38.jpg"},
    {img : "video6.mp4"},
    {img : "image39.jpg"},
    {img : "image40.jpg"},
    {img : "image41.jpg"},
    {img : "image42.jpg"},
    {img : "image43.jpg"},
    {img : "image44.jpg"},
    {img : "video7.mp4"},
    {img : "image45.jpg"},
    {img : "image46.jpg"},
    {img : "image47.jpg"},
    {img : "image48.jpg"},
    {img : "image49.jpg"},
    {img : "image50.jpg"},
    {img : "image51.jpg"},
    {img : "image52.jpg"},
    {img : "image53.jpg"},
    {img : "image54.jpg"},
    {img : "image55.jpg"}
];

const container = document.getElementById('image-container');
const currentImage = document.querySelector('.current-image');
const nextImage = document.querySelector('.next-image');
const revealCursor = document.querySelector('.reveal-cursor');
const currentVideo = document.querySelector('.current-video');
const nextVideo = document.querySelector('.next-video');
const currentBgVideo = document.querySelector('.current-bg-video');
const nextBgVideo = document.querySelector('.next-bg-video');

const revealSize = 200; // Size of the reveal heart
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isAnimating = false; // Lock flag to prevent cursor tracking during animation

// Helper function to check if file is a video
function isVideo(filename) {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// Helper function to set media (image or video)
function setMedia(layer, videoElement, filename) {
    const path = `./public/${filename}`;
    const bgVideo = layer.querySelector('.bg-video');
    
    if (isVideo(filename)) {
        // It's a video - play both background and foreground videos
        layer.style.backgroundImage = 'none';
        
        // Background video (blurred)
        if (bgVideo) {
            bgVideo.src = path;
            bgVideo.style.display = 'block';
            bgVideo.load();
            bgVideo.play().catch(err => console.log('Background video autoplay prevented:', err));
        }
        
        // Foreground video (clear)
        videoElement.src = path;
        videoElement.style.display = 'block';
        videoElement.load();
        videoElement.play().catch(err => console.log('Video autoplay prevented:', err));
    } else {
        // It's an image
        videoElement.style.display = 'none';
        videoElement.pause();
        videoElement.src = '';
        
        if (bgVideo) {
            bgVideo.style.display = 'none';
            bgVideo.pause();
            bgVideo.src = '';
        }
        
        layer.style.backgroundImage = `url('${path}')`;
    }
}

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
    setMedia(nextImage, nextVideo, images[nextPosition].img);
}

// Update previous image preview
function updatePreviousImage() {
    const prevPosition = (position - 1 + images.length) % images.length;
    setMedia(nextImage, nextVideo, images[prevPosition].img);
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
            
            // Update current media to what was revealed
            setMedia(currentImage, currentVideo, images[position].img);
            
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
setMedia(currentImage, currentVideo, images[position].img);
updateNextImage();

// Songs Array
const songs = [
    { poster: "./poster/poster1.jpg", songName: "Tu Haiye Haali Aave", audio: "./audio/audio1.m4a" },
    { poster: "./poster/poster2.png", songName: "Saavariya", audio: "./audio/audio2.m4a" },
    { poster: "./poster/poster3.png", songName: "Vhalam aavo ne", audio: "./audio/audio3.m4a" },
    { poster: "./poster/poster4.png", songName: "Mane Malje", audio: "./audio/audio4.m4a" },
    { poster: "./poster/poster5.png", songName: "Mann Melo", audio: "./audio/audio5.m4a" },
    { poster: "./poster/poster6.png", songName: "Darkhaast", audio: "./audio/audio6.m4a" },
    { poster: "./poster/poster7.png", songName: "Ishq Hai", audio: "./audio/audio7.m4a" },
    { poster: "./poster/poster8.jpg", songName: "Satranga", audio: "./audio/audio8.m4a" },
    { poster: "./poster/poster9.jpg", songName: "Kaise Hua", audio: "./audio/audio9.m4a" },
    { poster: "./poster/poster10.jpg", songName: "Kesariya", audio: "./audio/audio10.m4a" }
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
const miniProgressBar = document.getElementById('mini-progress-bar');
const miniPlayPauseBtn = document.getElementById('mini-play-pause');
const progressBar = document.getElementById('progress-bar');
const progressSlider = document.getElementById('progress-slider');
const currentTimeDisplay = document.getElementById('current-time');
const durationTimeDisplay = document.getElementById('duration-time');
const currentSongTitle = document.getElementById('current-song-title');
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

// Open song menu on mini player info click
miniPlayer.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Don't open if clicking play button
    if (e.target.closest('.mini-control-btn')) {
        return;
    }
    
    // Open menu
    songMenu.classList.remove('hidden');
    songMenu.classList.add('show');
});

// Mini play/pause button
miniPlayPauseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlayPause();
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
    if (currentSongTitle) {
        currentSongTitle.textContent = song.songName;
    }
    
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
    if (miniPlayPauseBtn) {
        miniPlayPauseBtn.textContent = icon;
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

// Progress tracking
audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        if (progressSlider) {
            progressSlider.value = progress;
        }
        if (miniProgressBar) {
            miniProgressBar.style.width = progress + '%';
        }
        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        }
    }
});

// Duration loaded
audioPlayer.addEventListener('loadedmetadata', () => {
    if (durationTimeDisplay) {
        durationTimeDisplay.textContent = formatTime(audioPlayer.duration);
    }
});

// Seek functionality
if (progressSlider) {
    progressSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        const seekTime = (progressSlider.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    });
}

// Initialize song list
populateSongList();

// Set random song as ready (will play on first user interaction)
const randomIndex = Math.floor(Math.random() * songs.length);
currentSongIndex = randomIndex;
audioPlayer.src = songs[randomIndex].audio;
discPoster.src = songs[randomIndex].poster;
miniPoster.src = songs[randomIndex].poster;
miniSongName.textContent = songs[randomIndex].songName;
if (currentSongTitle) {
    currentSongTitle.textContent = songs[randomIndex].songName;
}
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