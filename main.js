const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
const hangupButton = document.getElementById("hangupButton");
callButton.disabled = true;
hangupButton.disabled = true;
startButton.addEventListener("click", start);
callButton.addEventListener("click", call);
hangupButton.addEventListener("click", hangup);

let startTime;
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const videoWidth = 320;
const videoHeight = 240;

localVideo.addEventListener("loadedmetadata", function () {
    console.log(
        `Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`
    );
});

remoteVideo.addEventListener("loadedmetadata", function () {
    console.log(
        `Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`
    );
});

remoteVideo.addEventListener("resize", () => {
    console.log(
        `Remote video size changed to ${remoteVideo.videoWidth}x${
            remoteVideo.videoHeight
        } - Time since pageload ${performance.now().toFixed(0)}ms`
    );
    // We'll use the first onsize callback as an indication that video has started
    // playing out.
    if (startTime) {
        const elapsedTime = window.performance.now() - startTime;
        console.log("Setup time: " + elapsedTime.toFixed(3) + "ms");
        startTime = null;
    }
});

let localStream;

async function start() {
    console.log("Requesting local stream");
    startButton.disabled = true;

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoTrack = stream.getVideoTracks()[0];

    const currentSettings = videoTrack.getSettings();
    const constraints = {
        ...currentSettings,
        width: videoWidth,
        height: videoHeight,
        frameRate: { exact: 15 },
    };
    await videoTrack.applyConstraints(constraints);
    localVideo.srcObject = stream;
    localStream = stream;
    callButton.disabled = false;
}

async function call() {
    callButton.disabled = true;
    hangupButton.disabled = false;
    console.log("Starting call");
    startTime = window.performance.now();
    const videoTracks = localStream.getVideoTracks();
    const audioTracks = localStream.getAudioTracks();
    if (videoTracks.length > 0) {
        console.log(`Using video device: ${videoTracks[0].label}`);
    }
    if (audioTracks.length > 0) {
        console.log(`Using audio device: ${audioTracks[0].label}`);
    }

    const videoElement = document.createElement("video");
    videoElement.srcObject = localStream;
    await videoElement.play();

    const localCanvas = document.createElement("canvas");
    const localContext = localCanvas.getContext('2d');
    localCanvas.width = videoWidth;
    localCanvas.height = videoHeight;

    async function drawVideoFrame() {
        let bitmap = await createImageBitmap(videoElement);
        localContext.drawImage(bitmap, 0, 0, localCanvas.width, localCanvas.height);
        bitmap.close();

        requestAnimationFrame(drawVideoFrame);
    }

    drawVideoFrame();

    remoteVideo.srcObject = localCanvas.captureStream(15);
}

async function hangup() {
    console.log("Ending call");
    remoteVideo.srcObject = null;
    hangupButton.disabled = true;
    callButton.disabled = false;
}
