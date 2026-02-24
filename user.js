// user.js - Screen sharing sender (BroadcastChannel)
console.log('user.js loaded');

let localStream = null;
let peerConnection = null;
let channel = null;

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

async function startShare() {
  try {
    // Get screen stream
    localStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });

    const localVideo = document.getElementById('localVideo');
    localVideo.srcObject = localStream;

    // Create BroadcastChannel for signaling
    channel = new BroadcastChannel('screen-share');
    
    // Listen for messages from admin
    channel.onmessage = async (event) => {
      console.log('Received message:', event.data.type);
      
      if (event.data.type === 'answer') {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(event.data.answer));
          updateStatus('Connected! Screen sharing active.');
        } catch (e) {
          console.error('Error setting answer:', e);
        }
      } else if (event.data.type === 'ice-candidate') {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(event.data.candidate));
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      }
    };

    // Create peer connection
    peerConnection = new RTCPeerConnection(configuration);
    console.log('Peer connection created');

    // Add local stream tracks to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('Generated ICE candidate');
        channel.postMessage({ type: 'ice-candidate', candidate: event.candidate.toJSON() });
      }
    };

    // Create offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log('Offer created');

    // Send offer to admin
    channel.postMessage({ type: 'offer', offer: offer });
    
    updateStatus('Waiting for viewer to connect...');

    // Handle stream end
    localStream.getVideoTracks()[0].onended = () => {
      console.log('Screen sharing ended');
      channel.postMessage({ type: 'end' });
      if (peerConnection) peerConnection.close();
      if (channel) channel.close();
    };

  } catch (error) {
    console.error('Error starting screen share:', error);
    alert('Error starting screen share: ' + error.message);
  }
}

function updateStatus(text) {
  const statusDiv = document.getElementById('status');
  if (statusDiv) {
    statusDiv.textContent = text;
  }
}
