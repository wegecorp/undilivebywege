const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Store sessions in memory
const sessions = new Map();

// Helper function to generate random number within range
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate session code
function generateSessionCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Create new session
  socket.on('createSession', ({ minNumber, maxNumber }) => {
    const sessionCode = generateSessionCode();
    const session = {
      code: sessionCode,
      minNumber,
      maxNumber,
      participants: new Map(),
      usedNumbers: new Set(),
      admin: socket.id,
      isDistributing: false,
      numbersDistributed: false
    };
    
    sessions.set(sessionCode, session);
    socket.join(sessionCode);
    
    socket.emit('sessionCreated', {
      sessionCode,
      minNumber,
      maxNumber
    });
  });
  
  // Join existing session
  socket.on('joinSession', ({ sessionCode, userName }) => {
    const session = sessions.get(sessionCode);
    
    if (!session) {
      socket.emit('error', 'Sesi tidak ditemukan');
      return;
    }
    
    if (session.numbersDistributed) {
      socket.emit('error', 'Nomor sudah dibagikan, tidak bisa bergabung');
      return;
    }
    
    // Add participant without number yet
    session.participants.set(socket.id, {
      userName,
      userNumber: null
    });
    
    socket.join(sessionCode);
    
    // Notify participant
    socket.emit('sessionJoined', {
      userName
    });
    
    // Notify admin about new participant
    io.to(session.admin).emit('participantJoined', {
      userName,
      participantId: socket.id
    });
    
    // Send current participants list to admin
    const participantsList = Array.from(session.participants.entries()).map(([id, participant]) => ({
      id,
      userName: participant.userName,
      userNumber: participant.userNumber
    }));
    
    io.to(session.admin).emit('participantsList', participantsList);
  });
  
  // Start number distribution
  socket.on('startDistribution', () => {
    const session = Array.from(sessions.values()).find(s => s.admin === socket.id);
    
    if (!session) {
      socket.emit('error', 'Anda bukan admin dari sesi ini');
      return;
    }
    
    if (session.participants.size === 0) {
      socket.emit('error', 'Belum ada peserta');
      return;
    }
    
    if (session.numbersDistributed) {
      socket.emit('error', 'Nomor sudah dibagikan sebelumnya');
      return;
    }
    
    session.isDistributing = true;
    io.to(session.code).emit('distributionStarted');
    
    // Generate random numbers for all participants
    const availableNumbers = Array.from(
      { length: session.maxNumber - session.minNumber + 1 },
      (_, i) => session.minNumber + i
    );
    
    // Shuffle array
    for (let i = availableNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
    }
    
    // Distribute numbers to participants
    let numberIndex = 0;
    for (const [participantId, participant] of session.participants) {
      const userNumber = availableNumbers[numberIndex++];
      participant.userNumber = userNumber;
      
      // Notify participant of their number
      io.to(participantId).emit('numberAssigned', {
        userNumber
      });
    }
    
    session.isDistributing = false;
    session.numbersDistributed = true;
    io.to(session.code).emit('distributionComplete');
    
    // Send updated participants list to admin
    const participantsList = Array.from(session.participants.entries()).map(([id, participant]) => ({
      id,
      userName: participant.userName,
      userNumber: participant.userNumber
    }));
    
    io.to(session.admin).emit('participantsList', participantsList);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and clean up session
    for (const [code, session] of sessions.entries()) {
      if (session.admin === socket.id) {
        // Admin disconnected, end session
        io.to(code).emit('error', 'Admin telah meninggalkan sesi');
        sessions.delete(code);
        break;
      }
      
      if (session.participants.has(socket.id)) {
        // Participant disconnected
        const participant = session.participants.get(socket.id);
        session.participants.delete(socket.id);
        
        if (session.participants.size === 0) {
          sessions.delete(code);
        } else {
          // Notify admin about participant leaving
          io.to(session.admin).emit('participantLeft', {
            userName: participant.userName,
            participantId: socket.id
          });
          
          // Send updated participants list to admin
          const participantsList = Array.from(session.participants.entries()).map(([id, participant]) => ({
            id,
            userName: participant.userName,
            userNumber: participant.userNumber
          }));
          
          io.to(session.admin).emit('participantsList', participantsList);
        }
        break;
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 