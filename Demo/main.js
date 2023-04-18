// Define Settings
const minQRSize = 100;
const maxQRSize = 150;

// Get DOM elements
const video = document.getElementById('webcam');
const captureBtn = document.getElementById('capture-btn');
const canvas = document.getElementById('qr-canvas');
const ctx = canvas.getContext('2d');
const message = document.getElementById('message');

// Calculate distance between two points
function calculateDistance(point1, point2) {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

// Capture and download image
function captureImage() {
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    captureCanvas.getContext('2d').drawImage(video, 0, 0);
    const imgDataUrl = captureCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgDataUrl;
    link.download = 'captured-image.png';
    link.click();
}

// Scan for QR code and update UI
function scanQRCode() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode) {
        const size = calculateDistance(qrCode.location.topLeftCorner, qrCode.location.topRightCorner);
        // message.innerText = `QR Code detected. Size: ${size.toFixed(2)}px`;

        if (size < minQRSize) {
            message.innerText += ' - Move Closer';
            video.style.border = '10px solid yellow';
            captureBtn.disabled = true;
        } else if (size > maxQRSize) {
            message.innerText += ' - Move Further Away';
            video.style.border = '10px solid yellow';
            captureBtn.disabled = true;
        } else {
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
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            scanQRCode();
        });
    } catch (err) {
        message.innerText = 'Error accessing the camera: ' + err.message;
    }
}

captureBtn.addEventListener('click', captureImage);

initCamera(); // Start camera and QR code scanning