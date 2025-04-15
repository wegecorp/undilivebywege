// Socket connection
const socket = io();

// Add connection status indicator
const connectionStatus = document.createElement('div');
connectionStatus.className = 'connection-status';
document.body.appendChild(connectionStatus);

// DOM Elements
const initialView = document.getElementById('initialView');
const createSessionView = document.getElementById('createSessionView');
const sessionView = document.getElementById('sessionView');
const createSessionBtn = document.getElementById('createSessionBtn');
const cancelCreateSessionBtn = document.getElementById('cancelCreateSessionBtn');
const confirmCreateSessionBtn = document.getElementById('confirmCreateSessionBtn');
const joinSessionBtn = document.getElementById('joinSessionBtn');
const sessionCodeInput = document.getElementById('sessionCode');
const userNameInput = document.getElementById('userName');
const minNumberInput = document.getElementById('minNumber');
const maxNumberInput = document.getElementById('maxNumber');
const currentSessionCode = document.getElementById('currentSessionCode');
const userNumberInfo = document.getElementById('userNumberInfo');
const userNumber = document.getElementById('userNumber');
const adminControls = document.getElementById('adminControls');
const startDistributionBtn = document.getElementById('startDistributionBtn');
const distributionStatus = document.getElementById('distributionStatus');
const participantsList = document.getElementById('participantsList');
const errorToast = document.getElementById('errorToast');

// State
let currentSession = null;
let isAdmin = false;

// Event Listeners
createSessionBtn.addEventListener('click', () => {
    initialView.classList.add('hidden');
    createSessionView.classList.remove('hidden');
});

cancelCreateSessionBtn.addEventListener('click', () => {
    createSessionView.classList.add('hidden');
    initialView.classList.remove('hidden');
});

confirmCreateSessionBtn.addEventListener('click', () => {
    const minNumber = parseInt(minNumberInput.value);
    const maxNumber = parseInt(maxNumberInput.value);
    
    if (minNumber >= maxNumber) {
        showError('Nomor terendah harus lebih kecil dari nomor tertinggi');
        return;
    }
    
    socket.emit('createSession', { minNumber, maxNumber });
});

joinSessionBtn.addEventListener('click', () => {
    const sessionCode = sessionCodeInput.value.trim();
    const userName = userNameInput.value.trim();
    
    if (!sessionCode || !userName) {
        showError('Mohon isi kode sesi dan nama Anda');
        return;
    }
    
    socket.emit('joinSession', { sessionCode, userName });
});

startDistributionBtn.addEventListener('click', () => {
    socket.emit('startDistribution');
});

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to server');
    connectionStatus.className = 'connection-status connected';
    connectionStatus.textContent = 'Connected';
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    connectionStatus.className = 'connection-status disconnected';
    connectionStatus.textContent = 'Disconnected - Reconnecting...';
    showError('Koneksi terputus. Mencoba menyambung kembali...');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    connectionStatus.className = 'connection-status error';
    connectionStatus.textContent = 'Connection Error';
});

socket.on('error', (message) => {
    showError(message);
});

socket.on('sessionCreated', ({ sessionCode, minNumber, maxNumber }) => {
    currentSession = sessionCode;
    isAdmin = true;
    currentSessionCode.textContent = sessionCode;
    createSessionView.classList.add('hidden');
    sessionView.classList.remove('hidden');
    adminControls.classList.remove('hidden');
    distributionStatus.textContent = 'Menunggu peserta bergabung...';
    participantsList.innerHTML = '<li class="empty-list">Belum ada peserta</li>';
});

socket.on('sessionJoined', ({ userName }) => {
    currentSessionCode.textContent = sessionCodeInput.value;
    initialView.classList.add('hidden');
    sessionView.classList.remove('hidden');
    if (isAdmin) {
        distributionStatus.textContent = 'Peserta bergabung. Siap untuk membagikan nomor.';
    } else {
        distributionStatus.textContent = 'Menunggu admin membagikan nomor...';
    }
});

socket.on('participantJoined', ({ userName }) => {
    if (isAdmin) {
        const li = document.createElement('li');
        li.className = 'participant-item';
        li.id = `participant-${userName}`;
        li.innerHTML = `<span class="participant-name">${userName}</span> <span class="participant-number">-</span>`;
        
        // Remove empty list message if it exists
        const emptyList = participantsList.querySelector('.empty-list');
        if (emptyList) {
            participantsList.removeChild(emptyList);
        }
        
        participantsList.appendChild(li);
    }
});

socket.on('participantLeft', ({ userName }) => {
    if (isAdmin) {
        const participantElement = document.getElementById(`participant-${userName}`);
        if (participantElement) {
            participantsList.removeChild(participantElement);
        }
        
        // Add empty list message if no participants left
        if (participantsList.children.length === 0) {
            const li = document.createElement('li');
            li.className = 'empty-list';
            li.textContent = 'Belum ada peserta';
            participantsList.appendChild(li);
        }
    }
});

socket.on('participantsList', (participants) => {
    if (isAdmin) {
        participantsList.innerHTML = '';
        
        if (participants.length === 0) {
            const li = document.createElement('li');
            li.className = 'empty-list';
            li.textContent = 'Belum ada peserta';
            participantsList.appendChild(li);
        } else {
            participants.forEach(participant => {
                const li = document.createElement('li');
                li.className = 'participant-item';
                li.id = `participant-${participant.userName}`;
                
                const numberText = participant.userNumber !== null ? participant.userNumber : '-';
                li.innerHTML = `<span class="participant-name">${participant.userName}</span> <span class="participant-number">${numberText}</span>`;
                
                participantsList.appendChild(li);
            });
        }
    }
});

socket.on('distributionStarted', () => {
    if (isAdmin) {
        startDistributionBtn.disabled = true;
        distributionStatus.textContent = 'Sedang membagikan nomor...';
    } else {
        distributionStatus.textContent = 'Admin sedang membagikan nomor...';
    }
});

socket.on('numberAssigned', ({ userNumber }) => {
    userNumberInfo.classList.remove('hidden');
    userNumber.textContent = userNumber;
    distributionStatus.textContent = 'Anda mendapatkan nomor: ' + userNumber;
});

socket.on('distributionComplete', () => {
    if (isAdmin) {
        distributionStatus.textContent = 'Nomor telah dibagikan ke semua peserta';
        startDistributionBtn.disabled = true;
    }
});

// Helper functions
function showError(message) {
    errorToast.textContent = message;
    errorToast.classList.remove('hidden');
    setTimeout(() => {
        errorToast.classList.add('hidden');
    }, 3000);
}

// Handle window close/refresh
window.addEventListener('beforeunload', () => {
    socket.disconnect();
}); 