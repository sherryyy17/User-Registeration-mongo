const express = require('express');
const mongoose = require("mongoose");
const { UserModel } = require("../src/user/model");

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
var path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json())
app.use(express.urlencoded({extended:false}));

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'app_views'));

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
