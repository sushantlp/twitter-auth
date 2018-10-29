"use strict";

const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new TwitterStrategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: "https://twitter-auth-sushantlp.c9users.io/api/v1/auth/twitter/callback"
  },
  function(accessToken, refreshToken, profile, done) {
     console.log("AccessToken");
    console.log(accessToken)
     console.log(refreshToken)
      console.log(profile)
       console.log(done)
      console.log("RefreshToken");
      
       return done
  }

));



module.exports = passport;