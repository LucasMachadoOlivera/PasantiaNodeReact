const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../models");
const bcrypt = require("bcrypt");

// Configurar Passport con bcrypt
passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const user = await db.Usuario.findOne({ where: { email: email } });
      if (!user) return done(null, false, { message: "Usuario no encontrado" });
      const match = await bcrypt.compare(password, user.contraseña);
      if (!match)
        return done(null, false, { message: "Contraseña incorrecta" });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await db.Usuario.findByPk(id);
  done(null, user);
});

module.exports = passport;
