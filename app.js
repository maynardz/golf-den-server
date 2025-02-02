require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
const bookingRoutes = require('./routes/bookingRoutes');
const { sequelize, Booking } = require('./models'); // Import models and sequelize instance

const app = express();
const server = createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: '*', // Allow frontend connections
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(bodyParser.json());

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Use routes
app.use('/api', bookingRoutes);

// Expose Socket.io instance globally
app.set('socketio', io);

// Sync models and initialize database
sequelize.sync({ force: false }) // Set to true in development to reset tables
  .then(() => console.log('Database synchronized successfully'))
  .catch((err) => console.error('Error synchronizing the database:', err));

sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));