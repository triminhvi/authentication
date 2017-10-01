var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var url = require('./config/db.js').url;
mongoose.connect(url);
var db = mongoose.connection;
var User = require('./models/user.js');
var session = require('express-session');
var passport = require('passport'); 
var flash = require('connect-flash');


var app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'anythingString',
    resave: true,
    saveUninitialized: true
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
  });

//Database
db.on('error', function(err){
    if(err){
        throw err;
        return;
    }
});
db.on('open', function(err){
    if(err){
        throw err;
        return;
    }
    console.log('Connected to DB');
});

//APP START
require('./config/passport.js')(passport);
var auth = require('./routes/auth.js');
app.use('/auth', auth);

app.get('/', function(req, res){
    res.render('mainpage');
});

//Profile Page
app.get('/profile', isLoggedIn, function(req,res){
    res.render('profile', {title: 'profile'});
});
app.listen(process.env.PORT || 3000, function(req, res){
    console.log("listening on port 3000");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}