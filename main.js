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

//Config for Passport
var LocalStrategy = require('passport-local').Strategy;
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});

//Sign up strategy
passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
function(req, email, password, done){
    //Sync call
    process.nextTick(function(){
        User.findOne({'username': email}, function(err, user){
            if(err){
                return done(err);
            }
            if(user){ // this email has been signed up
                return done(null, false, req.flash('signupMessage', 'That email already taken'));
            } else {
                var newUser = new User();
                newUser.username = email;
                newUser.password = password;

                newUser.save(function(err){
                    if(err){
                        throw err;
                    }
                    return done(null, newUser);
                });
            }
        });
    });
}));

//Login strategy
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, 
function(req, email, password, done){
    process.nextTick(function(){
        User.findOne({'username': email }, function(err, user){
            if(err){
                return done(err);
            }
            if(!user){
                return done(null, false, req.flash('loginMessage', 'No User Found'));
            }
            if(user.password != password){
                return done(null, false, req.flash('loginMessage', 'Invalid Password'));
            }
            return done(null, user);
        })
    });
}));

//APP START
app.get('/', function(req, res){
    //Cookies that has not been signed
    //console.log('Unsigned Cookies: ', req.cookies);
    //console.log(req.session)
    res.render('mainpage');
})

//User
app.get('/:username/:password', function(req,res){
    var newUser = new User();
    newUser.username = req.params.username;
    newUser.password = req.params.password;
    console.log(newUser.username + " " + newUser.password);
    newUser.save(function(err){
        if(err){
            throw err;
            return;
        }
        res.send('Success');
    })
});

//Signup
app.get('/signup', function (req,res){
    res.render('signup', {message: req.flash('signupMessage')});
});

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));

//Login
app.get('/login', function(req,res){
    res.render('login', {message: req.flash('loginMessage')});
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

//Logout
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
})

//Profile Page
app.get('/profile', isLoggedIn, function(req,res){
    res.render('profile', {user: req.user});//req.user is the one logins && is authenticated.
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