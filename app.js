const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./middleware/Passport');
const authRoutes = require('./routes/authRoutes'); 
const authMiddleware = require('./middleware/authMiddleware'); 
const MovieModel = require('./models/movieModel');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'secret', // Klucz tajny dla sesji
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(authRoutes);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
