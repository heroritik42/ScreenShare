// admin.js - Screen sharing receiver (PeerJS)
console.log('admin.js loaded');

let peer = null;

function updateStatus(text) {
  const statusDiv = document.getElementById('status');
  if (statusDiv) {
    statusDiv.textContent = text;
  }
}

// Check for peer ID in URL
const urlParams = new URLSearchParams(window.location.search);
const userPeerId = urlParams.get('id');

if (userPeerId) {
  // Connect to user who is calling
  connectToUser(userPeerId);
} else {
  // Start as admin waiting for connections
  startAdmin();
}

function startAdmin() {
  updateStatus('Connecting to PeerJS server...');
  
  // Create peer with a custom ID for easy connection
  peer = new Peer('admin-' + Math.random().toString(36).substr(2, 9));

  peer.on('open', (id) => {
    console.log('Admin peer ID: ' + id);
    const peerIdDiv = document.getElementById('peerId');
    if (peerIdDiv) {
      peerIdDiv.textContent = 'Your Admin ID: ' + id;
    }
    updateStatus('Waiting for screen share... (Share this ID with the user)');
  });

  // Wait for incoming calls
  peer.on('call', (call) => {
    console.log('Incoming call from:', call.peer);
    updateStatus('Receiving screen share...');

    // Answer the call
    call.answer(); // Don't send any stream, just answer

    call.on('stream', (remoteStream) => {
      console.log('Received remote stream');
      const remoteVideo = document.getElementById('remoteVideo');
      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream;
      }
      updateStatus('Connected! Viewing screen share.');
    });

    call.on('close', () => {
      updateStatus('Screen sharing ended');
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
}

function connectToUser(userPeerId) {
  updateStatus('Connecting to user...');
  
  // Create peer
  peer = new Peer();

  peer.on('open', (id) => {
    console.log('My peer ID: ' + id);
    
    // Call the user
    const call = peer.call(userPeerId, new MediaStream());
    
    call.on('stream', (remoteStream) => {
      console.log('Received remote stream');
      const remoteVideo = document.getElementById('remoteVideo');
      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream;
      }
      updateStatus('Connected! Viewing screen share.');
    });

    call.on('close', () => {
      updateStatus('Screen sharing ended');
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
}
