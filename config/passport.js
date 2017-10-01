var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user.js');
module.exports = function(passport){
    //Config for Passport
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
}