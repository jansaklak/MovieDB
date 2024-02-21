const express = require('express');
const router = express.Router();
const session = require('express-session');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const MovieModel = require('../models/movieModel');
const UserModel = require('../models/userModel'); 
const { findByUsername, createUser,findByUserID } = require('../models/userModel');

const movieModel = new MovieModel();

user_id = 0;

// Middleware do uwierzytelniania
const ensureAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
        return next();
    } else {
        // przekieruj użytkownika do strony logowania
        res.redirect('/login');
    }
};

// Ustawienie sesji
router.use(session({
    secret: 'your-secret-key', // Klucz tajny dla sesji
    resave: false,
    saveUninitialized: false
}));


router.get('/movies',ensureAuthenticated, async (req, res) => {
    try {
        const movies = await movieModel.getAllMovies();
        const userId = req.session.userId;

        const user = await UserModel.findByUserID(userId);
        console.log("user")
        console.log(user)
        const username = user ? user.username : '';

        const watchedMovies = await movieModel.getWatchedMovies(userId);
        console.log(watchedMovies)
        res.render('movies.ejs', { movies, watchedMovies, username });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching movies.' });
    }
});

router.get('/add',ensureAuthenticated, (req, res) => {
    res.render('addMovie');
});

router.post('/add', async (req, res) => {
    const { title, year, genre, rating, country } = req.body;
    console.log(req.body);
    try {
        const newMovie = await movieModel.addMovie({ title, year, genre, rating, country });
        res.redirect('/movies');
    } catch (error) {
        console.error('Błąd dodawania filmu:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas dodawania filmu. Spróbuj ponownie.' });
    }
});

router.get('/addWatchedMovie', async (req, res) => {
    try {
        // Pobranie listy filmów do wyświetlenia
        const movies = await movieModel.getAllMovies();
        res.render('addWatchedMovie.ejs', { movies, userId: req.session.userId });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching movies.' });
    }
});

router.post('/addWatchedMovie', async (req, res) => {
    const { movieId, user_rating } = req.body; // Pobieramy movieId oraz user_rating z ciała żądania
    const userId = req.session.userId;
    const user = await UserModel.findByUserID(userId);
    const user_id = user ? user.id : '';
    try {
        await movieModel.addWatchedMovie(user_id, movieId, user_rating); // Dodajemy user_rating jako trzeci parametr
        res.redirect('/movies');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while adding watched movie.' });
    }
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    user_name = username 
    try {
        const user = await findByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
        }

        req.session.userId = user.id; // Ustaw identyfikator użytkownika w sesji
        user_id = user.id;
        req.session.isAuthenticated = true;
        res.redirect('/movies');
    } catch (error) {
        console.error('Błąd logowania:', error);
        res.status(error.status || 500).json({ error: error.message || 'Wystąpił błąd podczas logowania. Spróbuj ponownie.' });
    }
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/', (req, res) => {
    res.render('index');
});

router.get('*', (req, res) => {
    res.redirect('/');
});

router.post('/register', [
    check('username').notEmpty().withMessage('Nazwa użytkownika jest wymagana'),
    check('password').notEmpty().withMessage('Hasło jest wymagane'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const existingUser = await findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Nazwa użytkownika jest już zajęta.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await createUser(username, hashedPassword);
        
        res.redirect('/login'); 
    } catch (error) {
        console.error('Błąd rejestracji:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;
