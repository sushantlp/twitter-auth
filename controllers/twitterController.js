"use strict";

const OAuth = require("oauth");
const passport = require("passport");
const Twitter = require("twitter");
const TwitterStrategy = require("passport-twitter").Strategy;
const User = require("../models/user");
const init = require("./init");

const share = require("./shareController");

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.CONSUMER_KEY,
      consumerSecret: process.env.CONSUMER_SECRET,
      callbackURL:
        "https://twitter-auth-sushantlp.c9users.io/api/v1/auth/twitter/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      const searchQuery = {
        twitter_id: profile.id
      };

      const updates = {
        twitter_id: profile.id,
        name: profile.displayName,
        access_token: accessToken,
        refresh_token: refreshToken,
        oauth_token: "",
        oauth_verifier: "",
        status: true
      };

      const options = {
        upsert: true
      };

      // update the user if s/he exists or add a new user
      User.findOneAndUpdate(searchQuery, updates, options, function(err, user) {
        if (err) {
          return done(err);
        } else {
          return done(null, user);
        }
      });
      return;
    }
  )
);

// serialize user into the session
init();

module.exports = passport;

module.exports.requestGetTweet = (req, res, next) => {
  if (req.session.hasOwnProperty("passport")) {
    if (req.session.passport.hasOwnProperty("user")) {
      User.findById(req.session.passport.user, function(err, user) {
        if (!err) {
          const client = new Twitter({
            consumer_key: process.env.CONSUMER_KEY,
            consumer_secret: process.env.CONSUMER_SECRET,
            access_token_key: user.access_token,
            access_token_secret: user.refresh_token
          });

          const params = {
            screen_name: user.name
          };

          client.get("statuses/user_timeline", params, function(
            error,
            tweets,
            response
          ) {
            if (!error) {
              // Request Logic Keep Complain
              return tweetJson(tweets)
                .then(response => {
                  return res
                    .status(200)
                    .send(
                      share.createJsonObject(
                        response.data,
                        response.msg,
                        "/api/v1/get/twitter",
                        200,
                        response.success,
                        {}
                      )
                    );
                })
                .catch(error => {
                  return res.status(500).send("Oops our bad!!!");
                });
            } else {
              return res.status(500).send("Oops our bad!!!");
            }
          });
        } else {
          return res.status(500).send("Oops our bad!!!");
        }
      });
    } else {
      return res.status(500).send("login please");
    }
  } else {
    return res.status(500).send("login please");
  }
};

const tweetJson = async tweet => {
  try {
    let arr = [];
    let responsedata = {};

    for (let i = 0; i < tweet.length; i++) {
      let obj = {};
      obj.text = tweet[i].text;
      if (tweet[i].hasOwnProperty("entities")) {
        if (tweet[i].entities.hasOwnProperty("urls")) {
          if (tweet[i].entities.urls.length > 0) {
            obj.url = tweet[i].entities.urls[0].url;
          } else {
            obj.url = "";
          }
        }

        if (tweet[i].entities.hasOwnProperty("media")) {
          if (tweet[i].entities.media.length > 0) {
            obj.media_url = tweet[i].entities.media[0].media_url_https;
            obj.tweet_url = tweet[i].entities.media[0].url;
          } else {
            obj.media_url = "";
            obj.tweet_url = "";
          }
        }
      }

      arr.push(obj);
    }

    return (responsedata = {
      success: true,
      msg: "Succesfull",
      data: arr
    });
  } catch (error) {
    return Promise.reject(error);
  }
};
