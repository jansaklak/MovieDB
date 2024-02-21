const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('baza.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        db.run(`CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            year INTEGER,
            genre TEXT,
            rating REAL,
            country TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating movies table:', err.message);
            } else {
                console.log('Movies table created or already exists');
            }
        });
        db.run(`CREATE TABLE IF NOT EXISTS watched_movies (
            user_id INTEGER,
            movie_id INTEGER,
            user_rating INTEGER,
            PRIMARY KEY(user_id, movie_id),
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(movie_id) REFERENCES movies(id)
        )`);
        
    }
});

class MovieModel {
    constructor() {
        this.db = db;
    }

    async getAllMovies() {
        const query = 'SELECT * FROM movies';
        return new Promise((resolve, reject) => {
            this.db.all(query, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    async addMovie(movieData) {
        const { title, year, genre, rating, country } = movieData;
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO movies (title, year, genre, rating, country) VALUES (?, ?, ?, ?, ?)';
            this.db.run(query, [title, parseInt(year), genre, rating, country], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ title, year, genre, rating, country });
                }
            });
        });
    }
    
    async getMovieById(id) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM movies WHERE id = ?';
            this.db.get(query, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    async updateMovie(id, movieData) {
        const { title, year, genre, rating, country } = movieData;
        return new Promise((resolve, reject) => {
            const query = 'UPDATE movies SET title = ?, year = ?, genre = ?, rating = ?, country = ? WHERE id = ?';
            this.db.run(query, [title, year, genre, rating, country, id], function (err) {
                if (err) reject(err);
                resolve({ id, title, year, genre, rating, country });
            });
        });
    }

    async deleteMovie(id) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM movies WHERE id = ?';
            this.db.run(query, [id], function (err) {
                if (err) reject(err);
                resolve(`Movie with id ${id} has been deleted`);
            });
        });
    }

    async addWatchedMovie(user_id, movie_id, rating) {
        const query = 'INSERT INTO watched_movies (user_id, movie_id, user_rating) VALUES (?, ?, ?)';
        return new Promise((resolve, reject) => {
            this.db.run(query, [user_id, movie_id, rating], function (err) {
                if (err) reject(err);
                resolve({ user_id, movie_id, rating });
            });
        });
    }

    async getWatchedMovies(user_id) {
        const query = `
            SELECT m.*, wm.user_rating 
            FROM movies m 
            JOIN watched_movies wm ON m.id = wm.movie_id 
            WHERE wm.user_id = ?
        `;
        return new Promise((resolve, reject) => {
            this.db.all(query, [user_id], (err, rows) => {
                if (err) reject(err);
                console.log(rows);
                resolve(rows);
            });
        });
    }
}

module.exports = MovieModel;
