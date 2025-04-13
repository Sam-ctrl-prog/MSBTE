// app.js - Complete login and signup system with MySQL
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
}

// Create HTML files in public directory
const indexHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auth System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        
        .container {
            display: flex;
            max-width: 800px;
            width: 100%;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        
        .form-container {
            background-color: white;
            padding: 30px;
            width: 50%;
        }
        
        h2 {
            text-align: center;
            color: #333;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .form-group input {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        button {
            width: 100%;
            padding: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        
        button:hover {
            background-color: #45a049;
        }
        
        .message {
            margin-top: 15px;
            color: red;
            text-align: center;
        }

        @media (max-width: 600px) {
            .container {
                flex-direction: column;
            }
            
            .form-container {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="form-container" id="login-form">
            <h2>Login</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit">Login</button>
                <div class="message" id="loginMessage"></div>
            </form>
        </div>
        
        <div class="form-container" id="signup-form">
            <h2>Sign Up</h2>
            <form id="signupForm">
                <div class="form-group">
                    <label for="signupName">Name</label>
                    <input type="text" id="signupName" required>
                </div>
                <div class="form-group">
                    <label for="signupEmail">Email</label>
                    <input type="email" id="signupEmail" required>
                </div>
                <div class="form-group">
                    <label for="signupPassword">Password</label>
                    <input type="password" id="signupPassword" required>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" required>
                </div>
                <button type="submit">Sign Up</button>
                <div class="message" id="signupMessage"></div>
            </form>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('loginMessage').style.color = 'green';
                    document.getElementById('loginMessage').textContent = 'Login successful!';
                    // Redirect to dashboard or home page
                    setTimeout(() => {
                        window.location.href = '/dashboard.html';
                    }, 1000);
                } else {
                    document.getElementById('loginMessage').textContent = data.message;
                }
            })
            .catch(error => {
                document.getElementById('loginMessage').textContent = 'An error occurred. Please try again.';
            });
        });
        
        document.getElementById('signupForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                document.getElementById('signupMessage').textContent = 'Passwords do not match!';
                return;
            }
            
            fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('signupMessage').style.color = 'green';
                    document.getElementById('signupMessage').textContent = 'Registration successful! Please login.';
                    document.getElementById('signupForm').reset();
                } else {
                    document.getElementById('signupMessage').textContent = data.message;
                }
            })
            .catch(error => {
                document.getElementById('signupMessage').textContent = 'An error occurred. Please try again.';
            });
        });
    </script>
</body>
</html>
`;

const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        .logout {
            background-color: #f44336;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to the Dashboard</h1>
        <p>You have successfully logged in!</p>
        <button class="logout" onclick="logout()">Logout</button>
    </div>

    <script>
        function logout() {
            // In a real app, you would clear the authentication token here
            alert('Logged out successfully');
            window.location.href = '/';
        }
    </script>
</body>
</html>
`;

// Write HTML files to public directory
fs.writeFileSync('public/index.html', indexHTML);
fs.writeFileSync('public/dashboard.html', dashboardHTML);

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Replace with your MySQL username
    password: 'Life',      // Replace with your MySQL password
    database: 'auth_system'  // This database will be created if it doesn't exist
});

// Connect to MySQL and set up database
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        if (err.code === 'ER_BAD_DB_ERROR') {
            // Create database if it doesn't exist
            const tempDb = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: ''
            });
            
            tempDb.query('CREATE DATABASE auth_system', (err) => {
                if (err) {
                    console.error('Error creating database:', err);
                    return;
                }
                console.log('Database created successfully');
                
                // Reconnect with newly created database
                db.connect(err => {
                    if (err) {
                        console.error('Error connecting to database after creation:', err);
                        return;
                    }
                    setupTable();
                });
            });
        }
        return;
    }
    setupTable();
});

// Setup users table
function setupTable() {
    console.log('Connected to MySQL database');
    
    // Create users table if it doesn't exist
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.query(createTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating users table:', err);
            return;
        }
        console.log('Users table checked/created');
    });
}

// API Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Error checking existing user:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Server error' 
                });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User with this email already exists' 
                });
            }
            
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Insert new user
            db.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error('Error inserting user:', err);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Server error' 
                        });
                    }
                    
                    res.status(201).json({ 
                        success: true, 
                        message: 'User registered successfully' 
                    });
                }
            );
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Error finding user:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Server error' 
                });
            }
            
            if (results.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }
            
            const user = results[0];
            
            // Validate password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }
            
            // In a real app, you would generate and send a JWT token here
            
            res.json({ 
                success: true, 
                message: 'Login successful',
                user: { id: user.id, name: user.name, email: user.email }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
});