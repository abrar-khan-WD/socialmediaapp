require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const SocketServer = require('./socketServer');
const corsOptions = {
  // allow credentials (cookies) to be sent
  credentials: true,
};


const app = express();

app.use(express.json())
app.options("*" , cors(corsOptions));
app.use(cors(corsOptions));
app.use(cookieParser())


//#region // !Socket
const http = require('http').createServer(app);
const io = require('socket.io')(http);



io.on('connection', socket => {
    SocketServer(socket);
})

//#endregion

//#region // !Routes
app.use('/api', require('./routes/authRouter'));
app.use('/api', require('./routes/userRouter'));
app.use('/api', require('./routes/postRouter'));
app.use('/api', require('./routes/commentRouter'));
app.use('/api', require('./routes/adminRouter'));
app.use('/api', require('./routes/notifyRouter'));
app.use('/api', require('./routes/messageRouter'));
//#endregion


const URI = process.env.MONGODB_URL;
mongoose.connect(URI, {
    useCreateIndex:true,
    useFindAndModify:false,
    useNewUrlParser:true,
    useUnifiedTopology:true
}, err => {
    if(err) throw err;
    console.log("Database Connected!!")
})

const port = process.env.PORT || 8080;

// Attach error handler for the HTTP server to surface listen errors (EADDRINUSE etc.)
http.on('error', (err) => {
  console.error('Server error', err);
  // If port is in use, log and exit so a supervisor (nodemon) can restart cleanly
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please free the port or change PORT.`);
    process.exit(1);
  }
});

http.listen(port, () => {
  console.log('Listening on', port);
});

// Log uncaught exceptions and unhandled rejections to aid debugging
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Recommended to restart process after uncaught exception
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Recommended to restart process on unhandled promise rejection
  process.exit(1);
});