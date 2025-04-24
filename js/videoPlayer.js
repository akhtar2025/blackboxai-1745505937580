class VideoPlayer {
    constructor() {
        this.video = document.getElementById('videoPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.slowBtn = document.getElementById('slowBtn');
        this.fastBtn = document.getElementById('fastBtn');
        this.progress = document.getElementById('progress');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.playbackSpeedDisplay = document.getElementById('playbackSpeed');
        this.videoUpload = document.getElementById('videoUpload');
        this.processModal = document.getElementById('processModal');
        
        // New control buttons
        this.playBtn = document.getElementById('playBtn');
        this.stopBtn2 = document.getElementById('stopBtn2');
        this.fastPlayBtn = document.getElementById('fastPlayBtn');
        this.slowPlayBtn = document.getElementById('slowPlayBtn');
        this.continueBtn = document.getElementById('continueVideo');
        
        this.lastPauseTime = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Video upload
        this.videoUpload.addEventListener('change', (e) => this.handleVideoUpload(e));

        // Disable original playback controls by removing event listeners
        // or simply do not add event listeners for old controls
        // Commenting out old controls event listeners:
        /*
        this.playPauseBtn.removeEventListener('click', () => this.togglePlay());
        this.stopBtn.removeEventListener('click', () => this.stopVideo());
        this.slowBtn.removeEventListener('click', () => this.changeSpeed('slow'));
        this.fastBtn.removeEventListener('click', () => this.changeSpeed('fast'));
        */

        // New control buttons
        this.playBtn.addEventListener('click', () => {
            this.video.play();
            this.updatePlayPauseButton();
            this.updateControlButtons();
        });
        
        this.stopBtn2.addEventListener('click', () => {
            // Instead of stopping immediately, pause and show process modal
            this.video.pause();
            this.showProcessModal();
            this.updateControlButtons();
        });

        // Continue button
        this.continueBtn.addEventListener('click', () => {
            if (this.video.paused) {
                this.video.play();
                this.updateControlButtons();
            }
        });
        
        this.fastPlayBtn.addEventListener('click', () => {
            this.setPlaybackSpeed(2.0);
            this.video.play();
            this.updateControlButtons();
        });
        
        this.slowPlayBtn.addEventListener('click', () => {
            this.setPlaybackSpeed(0.5);
            this.video.play();
            this.updateControlButtons();
        });

        // Video events
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('pause', () => {
            this.handlePause();
            this.updateControlButtons();
        });
        this.video.addEventListener('play', () => {
            this.updatePlayPauseButton();
            this.updateControlButtons();
        });
        this.video.addEventListener('ended', () => {
            this.handleVideoEnd();
            this.updateControlButtons();
        });

        // Progress bar
        document.querySelector('.progress-bar').addEventListener('click', (e) => this.setProgress(e));
    }

    setPlaybackSpeed(speed) {
        this.video.playbackRate = speed;
        this.playbackSpeedDisplay.textContent = speed + 'x';
    }

    updateControlButtons() {
        // Update play button
        this.playBtn.classList.toggle('bg-green-500', this.video.paused);
        this.playBtn.classList.toggle('bg-gray-500', !this.video.paused);
        
        // Update continue button
        this.continueBtn.classList.toggle('bg-green-600', this.video.paused);
        this.continueBtn.classList.toggle('bg-gray-500', !this.video.paused);
        
        // Update speed buttons
        this.fastPlayBtn.classList.toggle('bg-blue-500', this.video.playbackRate !== 2.0);
        this.fastPlayBtn.classList.toggle('bg-gray-500', this.video.playbackRate === 2.0);
        
        this.slowPlayBtn.classList.toggle('bg-yellow-500', this.video.playbackRate !== 0.5);
        this.slowPlayBtn.classList.toggle('bg-gray-500', this.video.playbackRate === 0.5);
    }

    handleVideoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('video/')) {
                alert('Please upload a valid video file');
                return;
            }

            const uploadBtn = event.target.parentElement;
            uploadBtn.classList.add('loading');

            const url = URL.createObjectURL(file);
            this.video.src = url;
            this.video.load();

            this.video.onloadeddata = () => {
                uploadBtn.classList.remove('loading');
                this.updatePlayPauseButton();
            };

            this.video.onerror = () => {
                uploadBtn.classList.remove('loading');
                alert('Error loading video. Please try another file.');
            };
        }
    }

    togglePlay() {
        // Disable togglePlay since control is via new buttons
    }

    updatePlayPauseButton() {
        const icon = this.playPauseBtn.querySelector('i');
        icon.className = this.video.paused ? 'fas fa-play' : 'fas fa-pause';
    }

    stopVideo() {
        this.video.pause();
        this.video.currentTime = 0;
        this.updatePlayPauseButton();
    }

    changeSpeed(direction) {
        const speeds = [0.25, 0.5, 1, 1.5, 2];
        let currentIndex = speeds.indexOf(this.video.playbackRate);
        
        if (direction === 'slow' && currentIndex > 0) {
            currentIndex--;
        } else if (direction === 'fast' && currentIndex < speeds.length - 1) {
            currentIndex++;
        }

        this.video.playbackRate = speeds[currentIndex];
        this.playbackSpeedDisplay.textContent = speeds[currentIndex] + 'x';
    }

    updateProgress() {
        const percent = (this.video.currentTime / this.video.duration) * 100;
        this.progress.style.width = percent + '%';
        
        // Update time display
        const currentTime = this.formatTime(this.video.currentTime);
        const duration = this.formatTime(this.video.duration);
        this.timeDisplay.textContent = `${currentTime} / ${duration}`;
    }

    setProgress(e) {
        const progressBar = e.currentTarget;
        const clickPosition = e.offsetX;
        const totalWidth = progressBar.offsetWidth;
        const clickPercent = (clickPosition / totalWidth);
        this.video.currentTime = clickPercent * this.video.duration;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    handlePause() {
        if (this.video.currentTime > 0) {
            const currentTime = this.video.currentTime;
            // Only show modal if this is not the end of the video and time has progressed
            if (currentTime < this.video.duration && currentTime !== this.lastPauseTime) {
                this.lastPauseTime = currentTime;
                this.showProcessModal();
            }
        }
    }

    showProcessModal() {
        this.processModal.classList.remove('hidden');
        // Reset form
        document.getElementById('processForm').reset();
    }

    handleVideoEnd() {
        this.updatePlayPauseButton();
        this.lastPauseTime = 0;
    }
}

// Initialize video player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.videoPlayer = new VideoPlayer();
});
