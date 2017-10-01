var mongoose = require('mongoose');
var UserSchema = mongoose.Schema({
    username: String,
    password: String
});

var User = module.exports = mongoose.model('user', UserSchema);