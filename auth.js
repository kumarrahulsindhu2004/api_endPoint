import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { Person } from "./models/Person.js";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log("Received credentials: ", username, password);
      const user = await Person.findOne({ username });

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

export default passport;
