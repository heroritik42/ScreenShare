// admin.js - Screen sharing receiver (BroadcastChannel)
console.log('admin.js loaded');

let peerConnection = null;
let channel = null;

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

// Create BroadcastChannel for signaling
channel = new BroadcastChannel('screen-share');

updateStatus('Waiting for screen share...');

// Listen for messages from user
channel.onmessage = async (event) => {
  console.log('Received message:', event.data.type);
  
  if (event.data.type === 'offer') {
    await startReceive(event.data.offer);
  } else if (event.data.type === 'ice-candidate') {
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(event.data.candidate));
      } catch (e) {
        console.error('Error adding ICE candidate:', e);
      }
    }
  } else if (event.data.type === 'end') {
    updateStatus('Screen sharing ended.');
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
  }
};

async function startReceive(offer) {
  try {
    updateStatus('Receiving screen share...');

    // Create peer connection
    peerConnection = new RTCPeerConnection(configuration);
    console.log('Peer connection created');

    // Handle ICE candidates
    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('Generated ICE candidate');
        channel.postMessage({ type: 'ice-candidate', candidate: event.candidate.toJSON() });
      }
    };

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream', event.streams[0]);
      const remoteVideo = document.getElementById('remoteVideo');
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
        console.log('Video element updated with stream');
      }
      updateStatus('Connected! Viewing screen share.');
    };

    // Set remote description (offer)
    console.log('Setting remote description...');
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    console.log('Remote description set');

    // Create answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log('Answer created');

    // Send answer to user
    channel.postMessage({ type: 'answer', answer: answer });
    console.log('Answer sent to user');

  } catch (error) {
    console.error('Error receiving screen share:', error);
    updateStatus('Error: ' + error.message);
  }
}

function updateStatus(text) {
  const statusDiv = document.getElementById('status');
  if (statusDiv) {
    statusDiv.textContent = text;
  }
}
