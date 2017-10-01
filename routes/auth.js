var express = require('express');
var router = express.Router();
var passport =require('passport');

//Signup
router.get('/signup', function (req,res){
    res.render('signup', {title: 'Sign Up',
                        message: req.flash('signupMessage')});
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));

//Login
router.get('/login', function(req,res){
    res.render('login', {title: 'Log In',
                        message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

//Logout
router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
})
module.exports = router;