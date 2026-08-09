const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false);
        }

        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email },
          ],
        });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            provider: "google",
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || "",
          });
        } else if (user.provider === "local" && !user.googleId) {
          user.googleId = profile.id;
          user.provider = "google";
          user.avatar = profile.photos?.[0]?.value || user.avatar;

          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;