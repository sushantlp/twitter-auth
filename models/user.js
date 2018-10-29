const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create User Schema
const User = new Schema({
  twitter_id:String,
  name: String,
  access_token:String,
  refresh_token:String,
  status:Boolean
});


module.exports = mongoose.model('users', User);
