const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session"); // Add this
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Add session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Static files should be in a public folder
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/chatApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// Create user schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const messageSchema = new mongoose.Schema({
    sender: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);

// Root route to serve login page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Dashboard route with authentication
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

// Signup route
app.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        req.session.user = username;
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        req.session.user = user.username;
        res.json({ success: true, username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user profile
app.get("/user", async (req, res) => {
  if (req.session.user) {
      try {
          // Find user by username and get their email
          const user = await User.findOne({ username: req.session.user });
          res.json({ 
              username: req.session.user,
              email: user.email // Include the email in the response
          });
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
  } else {
      res.status(401).json({ error: 'Unauthorized' });
  }
});

// Socket.io setup
io.on('connection', (socket) => {
    console.log('User connected');
    
    // Middleware to access session
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
    io.use(wrap(session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true
    })));

    socket.on('message', (msg) => {
        if (socket.request.session.user) {
            const username = socket.request.session.user;
            io.emit('message', { user: username, text: msg });
        }
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to logout' });
      }
      res.json({ success: true });
  });
});

// Start server
server.listen(3000, () => {
    console.log("Server running on port 3000");
});