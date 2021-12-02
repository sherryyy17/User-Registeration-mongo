const express = require('express');
const mongoose = require("mongoose");
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
var path = require('path');

const { UserModel } = require("../src/user/model");
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;

const app = express();
const port = 3000;

app.use(express.json())
app.use(session({
   secret:"mysecretkey",
   resave:false,
   saveUninitialized:true
}))

app.use(bodyParser.json())
app.use(express.urlencoded({extended:false}));

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'app_views'));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  UserModel.findById(id, function (err, user) {
      done(err, user);
  });
});

passport.use(new LocalStrategy({
  usernameField: "email"
}, function(username, password, done) {
      
      UserModel.findOne({ email: username }, async function (err, user) {
          if (err) { return done(err); }
          if (!user) { 
            console.log('not user');
            return done(null, false); 
          }
          const validPassword = await bcrypt.compare(
            password,
            user.password
          );
          if (!validPassword) {
            return done(null, false, {
              message: "Incorrect Password.",
            });
          }
          return done(null, user);
      });
}
));

app.get('/login', (req,res) => {
  res.render('login');
})

app.post('/login', passport.authenticate('local', { 
    failureRedirect: '/user/add' 
  }), (req, res) => {
    res.send("User logined!");
});

app.get("/user/add", (req, res) => {
    res.render('signup');
})

app.post("/user/add", async (req, res) => {
    const { password, cpassword} = req.body;

    const hash = await bcrypt.hash(password, 10);
    const chash = await bcrypt.hash(cpassword, 10);

    if(password === cpassword) {
      const emp = new UserModel({
          first_name: req.body.fname,
          last_name: req.body.lname,
          email: req.body.email,
          password: hash,
          cpassword: chash
      })
      console.log(emp);
      const registered = await emp.save();
      res.send("User registered!");
    } else {
      res.send("password are not matching")
    }

})

mongoose.connect("mongodb://localhost:27017/signupdb", {
  useNewUrlParser: "true",
});

mongoose.connection.on("error", err => {
  console.log("err", err)
});

mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected")
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
