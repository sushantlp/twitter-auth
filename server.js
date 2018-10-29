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
require("express-group-routes");


// Load environment variables from .env file, where API keys and passwords are configured.
dotEnv.load({ path: ".env" });

// Create Express server.
const app = express();

// *** mongoose *** //
mongoose.connect(`mongodb://${process.env.MLAB_USER}:${process.env.MLAB_PASSWORD}@ds145083.mlab.com:45083/twitter`,{ useNewUrlParser: true });

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



// Index Route
app.get("/", (req, res) => {
 res.status(200).send('Hello World');
});

// Version 1 API
app.group("/api/v1", router => {
  router.get("/auth/twitter", twitter.authenticate('twitter'));
  router.get('/auth/twitter/callback',
  twitter.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    res.status(200).json(req.user);
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
