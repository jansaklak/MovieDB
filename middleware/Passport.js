const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { findByUsername, findUserById } = require('../models/userModel');

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      findByUsername(username, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Nieprawidłowa nazwa użytkownika' });
        }
        if (password !== user.password) {
          return done(null, false, { message: 'Nieprawidłowe hasło' });
        }

        return done(null, user);
      });
    } catch (err) {
      // Jeśli wystąpił błąd, zwróć błąd
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  findUserById(id, (err, user) => {
    if (err) { return done(err); }
    done(null, user);
  });
});

module.exports = passport;
