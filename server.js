const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware setup (order matters!)
app.use(express.json());
app.use(cors());

// Session middleware
const sessionMiddleware = session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});
app.use(sessionMiddleware);

// Static files
app.use(express.static("public"));

// MongoDB connection with better error handling
mongoose.connect("mongodb://localhost:27017/chatApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// Check if user is authenticated
function isAuthenticated(req, res, next) {
    console.log('Checking authentication for:', req.session.user);
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
    createdAt: { type: Date, default: Date.now }
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

// DATABASE CHECK ROUTES
// Check database connection
app.get('/check-db', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        const userCount = await User.countDocuments();
        const messageCount = await Message.countDocuments();
        
        res.json({
            status: 'success',
            database: {
                state: states[dbState],
                connection: dbState === 1 ? 'Connected' : 'Not Connected'
            },
            collections: {
                users: userCount,
                messages: messageCount
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// View all users (for debugging)
app.get('/debug/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude passwords
        res.json({
            status: 'success',
            count: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// View all messages (for debugging)
app.get('/debug/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 }).limit(20);
        res.json({
            status: 'success',
            count: messages.length,
            messages: messages
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Signup route
app.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: "User already exists with this email or username" 
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        
        req.session.user = username;
        console.log('User registered and session created:', username);
        
        res.status(201).json({ 
            success: true,
            message: "User registered successfully",
            username: username
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('Password mismatch for:', email);
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        req.session.user = user.username;
        console.log('Login successful, session created:', user.username);
        
        res.json({ 
            success: true, 
            username: user.username,
            message: "Login successful"
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user profile
app.get("/user", async (req, res) => {
    if (req.session.user) {
        try {
            const user = await User.findOne({ username: req.session.user });
            res.json({ 
                username: req.session.user,
                email: user.email
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Socket.io setup with session sharing
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

io.on('connection', (socket) => {
    console.log('User connected');
    
    socket.on('message', async (msg) => {
        if (socket.request.session.user) {
            const username = socket.request.session.user;
            
            // Save message to database
            try {
                const newMessage = new Message({
                    sender: username,
                    message: msg
                });
                await newMessage.save();
            } catch (error) {
                console.error('Error saving message:', error);
            }
            
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

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start server
server.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
    console.log("📊 Database check: http://localhost:3000/check-db");
    console.log("👥 Debug users: http://localhost:3000/debug/users");
    console.log("💬 Debug messages: http://localhost:3000/debug/messages");
});