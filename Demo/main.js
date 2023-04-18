// Define Settings
const minQRRatio = 0.15
const maxQRRatio = 0.20
minQRSize = null;
maxQRSize = null;

// Get DOM elements
const introSection = document.getElementById('intro-section');
const startBtn = document.getElementById('start-btn');
const captureSection = document.getElementById('capture-section');
const video = document.getElementById('webcam');
const captureBtn = document.getElementById('capture-btn');
const canvas = document.getElementById('qr-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const message = document.getElementById('message');

// Calculate distance between two points
function calculateDistance(point1, point2) {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

// Capture and download full-resolution image
function captureImage() {
    const videoTrack = video.srcObject.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);

    imageCapture.takePhoto()
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `SelfCapture_${new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '')}.png`;
            link.click();
        })
        .catch(error => {
            message.innerText = 'Error capturing image: ' + error.message;
        });
}

// Scan for QR code and update UI
function scanQRCode() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode) {
        const size = calculateDistance(qrCode.location.topLeftCorner, qrCode.location.topRightCorner);

        if (size < minQRSize) {
            message.innerText = 'Move Closer';
            video.style.border = '10px solid yellow';
            captureBtn.disabled = true;
        } else if (size > maxQRSize) {
            message.innerText = 'Move Further Away';
            video.style.border = '10px solid yellow';
            captureBtn.disabled = true;
        } else {
            message.innerText = '';
            video.style.border = '10px solid green';
            captureBtn.disabled = false;
        }
    } else {
        message.innerText = 'No QR code detected.';
        video.style.border = '10px solid red';
        captureBtn.disabled = true;
    }

    requestAnimationFrame(scanQRCode);
}

// Initialize camera
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 },
            }, audio: false
        });
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            minQRSize = video.videoWidth * minQRRatio;
            maxQRSize = video.videoWidth * maxQRRatio;
        });

        // Enable the start button when the camera has received its first frame
        video.addEventListener('playing', () => {
            scanQRCode();
            startBtn.innerText = "Start";
            startBtn.disabled = false;
        });

    } catch (err) {
        message.innerText = 'Error accessing the camera: ' + err.message;
    }
}
// Show capture section, hide intro section and start the camera
function startView() {
    introSection.hidden = true;
    captureSection.hidden = false;
}

startBtn.addEventListener('click', startView);
captureBtn.addEventListener('click', captureImage);

initCamera(); // Start camera and QR code scanning
