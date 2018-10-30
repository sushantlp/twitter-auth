"use strict";

// Module Dependencies.
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const errorHandler = require("errorhandler");
const dotEnv = require("dotenv");
const path = require("path");
const expressStatusMonitor = require("express-status-monitor");
const favicon = require("serve-favicon");
const robots = require("express-robots");
const sass = require("node-sass-middleware");
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const router = express.Router();
 const User = require('./models/user');
 
require("express-group-routes");


// Load environment variables from .env file, where API keys and passwords are configured.
dotEnv.load({ path: ".env" });

// Create Express server.
const app = express();

// *** mongoose *** //
mongoose.connect(`mongodb://${process.env.MLAB_USER}:${process.env.MLAB_PASSWORD}@ds145463.mlab.com:45463/twitter`,{ useNewUrlParser: true });

// enable cors
const corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

// Use morgan to log requests to the console
app.use(morgan("dev"));

// Express configuration.
app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
app.set("port", process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);

app.use(expressStatusMonitor());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(
  sass({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public")
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(robots(path.join(__dirname, "public", "robots.txt")));
app.disable("etag");


// Controllers (route handlers).
const twitter = require("./controllers/twitterController");
const share = require("./controllers/shareController");

// Index Route
app.get("/", (req, res) => {
 res.status(200).send('Hello World');
});

// Index Route
app.get("/login", (req, res) => {
  return res
    .status(200)
    .send(
    share.createJsonObject(
      [],
      "Login please",
      "/login",
      200,
      false,
      {}
    )
  );
});

// Version 1 API
app.group("/api/v1", router => {
   
   router.get("/get/twitter", twitter.requestGetTweet);
  router.get("/auth/twitter", twitter.authenticate('twitter'));
  router.get('/auth/twitter/callback',
  twitter.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication
    console.log(req.session.passport)
    const searchQuery = {
      twitter_id: req.user.twitter_id
    };
    
    
    const updates = {
      oauth_token:req.query.oauth_token,
      oauth_verifier:req.query.oauth_verifier
    };
    
    const options = {
      upsert: true
    };
    
    // update the user if s/he exists or add a new user
    User.findOneAndUpdate(searchQuery, updates, options, function(err, user) {
      if(err) {
        res.status(500).send('error');
        return res
          .status(500)
          .send(
          share.createJsonObject(
          [],
      "Oops our bad!!!",
      "/auth/twitter/callback",
      500,
      false,
      {}
    )
  );
  
      } else {
         return res
    .status(200)
    .send(
    share.createJsonObject(
      [],
      "Successful",
      "/auth/twitter/callback",
      200,
      true,
      {}
    )
  );
      }
    });
  });
});




// Error Handler.
app.use(errorHandler());

// Start Express server.
app.listen(app.get("port"), () => {
  console.log("Server Start");
});


// If Production then Execute
if (process.env.APP_ENV.toUpperCase() == "PROD") {
  app.all("*", function(req, res) {
    res.redirect(process.env.PRODUCTION_URL);
  });
} else {
  app.all("*", function(req, res) {
    res.redirect(process.env.DEVELOPMENT_URL);
  });
}


// Export
module.exports = app;
