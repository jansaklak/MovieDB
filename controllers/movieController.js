const MovieModel = require('../models/movieModel');

exports.getAllMovies = async (req, res) => {
    try {
        const movies = await MovieModel.getAllMovies();
        res.json(movies);
    } catch (error) {
        console.error('Błąd pobierania filmów:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas pobierania filmów. Spróbuj ponownie.' });
    }
};

exports.addMovie = async (req, res) => {
    const { title, year, genre, rating, country ,addedBy} = req.body;

    try {
        const newMovie = await MovieModel.addMovie({ title, year, genre, rating, country,addedBy });
        res.status(201).json(newMovie);
    } catch (error) {
        console.error('Błąd dodawania filmu:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas dodawania filmu. Spróbuj ponownie.' });
    }
};

exports.getMovieById = async (req, res) => {
    const { id } = req.params;

    try {
        const movie = await MovieModel.getMovieById(id);
        if (!movie) {
            return res.status(404).json({ error: 'Nie znaleziono filmu o podanym identyfikatorze' });
        }
        res.json(movie);
    } catch (error) {
        console.error('Błąd pobierania filmu:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas pobierania filmu. Spróbuj ponownie.' });
    }
};

exports.updateMovie = async (req, res) => {
    const { id } = req.params;
    const { title, year, genre, rating, country} = req.body;

    try {
        const updatedMovie = await MovieModel.updateMovie(id, { title, year, genre, rating, country  });
        res.json(updatedMovie);
    } catch (error) {
        console.error('Błąd aktualizacji filmu:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas aktualizacji filmu. Spróbuj ponownie.' });
    }
};

exports.deleteMovie = async (req, res) => {
    const { id } = req.params;

    try {
        const message = await MovieModel.deleteMovie(id);
        res.json({ message });
    } catch (error) {
        console.error('Błąd usuwania filmu:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas usuwania filmu. Spróbuj ponownie.' });
    }
};
