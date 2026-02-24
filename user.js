// user.js - Screen sharing sender (PeerJS)
console.log('user.js loaded');

let localStream = null;
let peer = null;
let call = null;

function updateStatus(text) {
  const statusDiv = document.getElementById('status');
  if (statusDiv) {
    statusDiv.textContent = text;
  }
}

function showLink(adminPeerId) {
  const linkDiv = document.getElementById('link');
  if (linkDiv) {
    const shareUrl = window.location.href.split('?')[0].replace('user.html', 'admin.html') + '?id=' + adminPeerId;
    linkDiv.innerHTML = `
      <p>Share this link with the person sharing their screen:</p>
      <input type="text" value="${shareUrl}" style="width: 100%; padding: 10px; background: #0f172a; color: white; border: 1px solid #334155; border-radius: 4px;" readonly>
    `;
  }
}

async function startShare() {
  try {
    // Get screen stream
    localStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });

    const localVideo = document.getElementById('localVideo');
    localVideo.srcObject = localStream;
    updateStatus('Connected to PeerJS server...');

    // Get admin peer ID from URL or prompt
    let adminPeerId = new URLSearchParams(window.location.search).get('id');
    
    if (!adminPeerId) {
      adminPeerId = prompt('Enter the Admin Peer ID:');
    }
    
    if (!adminPeerId) {
      updateStatus('Error: No Admin Peer ID provided');
      return;
    }

    // Create peer (no ID - let server assign one)
    peer = new Peer();

    peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      updateStatus('Calling admin...');

      // Call the admin
      call = peer.call(adminPeerId, localStream);
      
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        updateStatus('Connected! Screen sharing active.');
      });

      call.on('close', () => {
        updateStatus('Call ended');
      });

      call.on('error', (err) => {
        console.error('Call error:', err);
        updateStatus('Error: ' + err.message);
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      updateStatus('Error: ' + err.message);
    });

  } catch (error) {
    console.error('Error starting screen share:', error);
    updateStatus('Error: ' + error.message);
  }
}

// Check if this is being called by admin
const urlParams = new URLSearchParams(window.location.search);
const callerId = urlParams.get('caller');

if (callerId) {
  // This user is receiving a call (they're the admin in this case, but we're in user.js)
  peer = new Peer();

  peer.on('call', (call) => {
    navigator.mediaDevices.getDisplayMedia({ video: true })
      .then((stream) => {
        call.answer(stream); // Answer with our screen
        updateStatus('Screen sharing started');
      })
      .catch((err) => {
        console.error('Failed to get screen stream', err);
      });
  });
}
