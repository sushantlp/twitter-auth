"use strict";

const OAuth = require('oauth');
const passport = require('passport');
const Twitter = require('twitter');
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/user');
const init = require('./init');

const share = require("./shareController");

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
        refresh_token:refreshToken,
        oauth_token:"",
        oauth_verifier:"",
        status:true
    };

    const options = {
      upsert: true
    };
    
    // update the user if s/he exists or add a new user
    User.findOneAndUpdate(searchQuery, updates, options, function(err, user) {
      if(err) {
        console.log("Error")
        return done(err);
      } else {
         console.log("Success")
        return done(null, user);
      }
    });
    return 
  }

));

// serialize user into the session
init()

module.exports = passport;


module.exports.requestGetTweet = async (req, res,next) => {
    
 const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: '463715583-lpjWNp6vWoh2uft7NAQEfSw5oiYt5ET3fOzDwiHY',
    access_token_secret: 'iair44vEaTyWsa6E9xRmu7dhP7XzCiBLvYkQLgJuYng3J'
});
    
    const params = {screen_name: 'sushant singh chauhan'};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
        console.log(tweets);
    
        return res.send(tweets)
    }
});

 
    
 

 
  
 
}


