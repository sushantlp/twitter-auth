"use strict";

const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/user');
const init = require('./init');

passport.use(new TwitterStrategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: "https://twitter-auth-sushantlp.c9users.io/api/v1/auth/twitter/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    const searchQuery = {
      twitter_id: profile.id
    };

    const updates = {
        twitter_id: profile.id,
        name: profile.displayName,
        access_token:accessToken,
        refresh_token:refreshToken
    };

    const options = {
      upsert: true
    };

    // update the user if s/he exists or add a new user
    User.findOneAndUpdate(searchQuery, updates, options, function(err, user) {
      if(err) {
        return done(err);
      } else {
        return done(null, user);
      }
    });
  }

));

// serialize user into the session
init();

module.exports = passport;