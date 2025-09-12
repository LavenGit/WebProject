const express = require('express');
const hbs = require('hbs');
const path = require('path'); 
const axios = require('axios');
const app = express();
const http = require('http');
const url = require('url')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose() //verbose provides more detailed stack trace
const db = new sqlite3.Database('db_1200iRealSongs')
const PORT = process.env.PORT || 3000;

// Body parser middleware
app.use(express.urlencoded({ extended: false }));

// Set Handlebars as the template engine
app.set('view engine', 'hbs');

app.set('views', __dirname + '/views');

let tasks = [];

//app.engine('hbs', exphbs({ extname: 'hbs' }));

// Routes
app.get('/', (req, res) => {
    // Sort tasks by rating in descending order
    tasks.sort((a, b) => b.rating - a.rating);
    res.render('index', { tasks });
});
app.get('/newpage',(req, res) => {
    res.render('newpage'); 
});

const rout = require('./auth'); // Importing the authenticate middleware from auth.js


app.use(rout.authenticate);
app.get('/users', rout.users)
app.get('/title',(req, res) => {
    res.render('title'); 
});
app.get('/level2', (req, res) => {
    res.render('level2'); 
});

app.post('/add', (req, res) => {
    const { title, description, rating } = req.body;
    tasks.push({ title, description, rating: parseInt(rating), completed: false });
    res.redirect('/');
});

app.post('/complete/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    tasks[taskId].completed = true;
    res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    tasks.splice(taskId, 1);
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query the database to check if user exists
    db.get('SELECT * FROM users WHERE userid = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            return console.error('Error querying database:', err.message);
        }
        if (row) {
            // User exists in the database, redirect to home page
            res.redirect('/');
            
        } else {
            // User not found in the database, redirect back to login page
            res.redirect('/login');
        }
    });
});
app.get('/chuck-norris-joke', async (req, res) => {
    try {
        const response = await axios.get('https://api.chucknorris.io/jokes/random');
        const joke = response.data.value; // Extract the joke from the response
        res.json({ joke });
    } catch (error) {
        console.error('Error fetching Chuck Norris joke:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to render the joke page at localhost:3000/jokes
app.get('/jokes', (req, res) => {
    res.render('joke');
});
// Route to handle adding a new user
app.post('/addUser', (req, res) => {
    const { username, password } = req.body;
    const role = 'guest'; // Assuming all users added from title page are guests

    // Insert the user's details into the database
    const sql = 'INSERT INTO users (userid, password, role) VALUES (?, ?, ?)';
    db.run(sql, [username, password, role], function(err) {
        if (err) {
            return console.error('Error inserting user:', err.message);
        }
        console.log(`A new user with username ${username} has been added as a guest.`);
        res.redirect('/title'); // Redirect back to the title page after adding user
    });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log("http://localhost:3000/login");
    console.log("http://localhost:3000/users");

    
});