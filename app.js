//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const mongoose = require("mongoose");

var _ = require('lodash');

var session = require('express-session')
var passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.use(session({
  //secret: 'i am raghav patel',
  secret: process.env.sessionSec,
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());
const db = process.env.mongoUrl;
//const db="mongodb+srv://raghavnp:bhai2003bhai@cluster0.kahfwrm.mongodb.net/blogDB?retryWrites=true&w=majority";
mongoose.connect(db).then(() => {
  console.log("connection sucess fully");
}).catch((err) => console.log(err));
//1 User
const userSchema = new mongoose.Schema({
  username: String,
  password: String,

})


userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);

const memberSchema = new mongoose.Schema({
  name: String,
  designation: String,
  mail: String
})
const Member = new mongoose.model("Member", memberSchema);


passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//2. post

const postSchema = {
  title: String,
  postbody: String,
  linkdis: [String],
  livelink: [String]

};
const Post = mongoose.model("Post", postSchema);


//3. Owner
const ownerSchema = {
  name: String
}

const Owner = mongoose.model("Owner", ownerSchema);
//const owner=new Owner({
//  name:"patelraghavkumar222@gmail.com"
//})
//owner.save();
const mentorSchema = {
  phone: String,
  mail: String,
  topic: String
}
const Mentor = mongoose.model("Mentor", mentorSchema);



const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. DictumNon diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla.  Amet massa vitae tortor condimentum lacinia quis vel eros.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


//    ---------------------------------- GET ----------------------------------------------------------------------//
app.get("/home", function (req, res) {

  //res.render("home", {st: homeStartingContent, addpost : Listofposts });
  if (req.isAuthenticated()) {
    Post.find({}, function (err, posts) {
      res.render("home", {
        st: homeStartingContent,
        addpost: posts
      });

    })
  }
  else {
    res.status(401).render("login", { errorMessage: "*Logging in to access home page" });

    //res.redirect("/login");
  }
});



app.get("/about", function (req, res) {
  if (req.isAuthenticated()) {
    Member.find({}, function (err, members) {
      res.render("about", {
        st: aboutContent,
        obj: members
      });

    })
  }
  else {
    res.status(401).render("login", { errorMessage: " *Logging in to access about page" });
    //res.redirect("/login");
  }
});


app.get("/contact", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("contact", { st: contactContent });
  }
  else {
    res.status(401).render("login", { errorMessage: "*Logging in to access contact page" });
    //res.redirect("/login");
  }
});


app.get("/compose", function (req, res) {
  if (req.isAuthenticated()) {
      //console.log(req.user);
    Owner.findOne({ name: req.user.username }, function (err, postt) {
      //console.log(postt);
      //console.log("Owner");
      //console.log(Owner);
      if (postt == null) {
        res.render("submit", { status: "*You are not authorised person to post Blog..." });
      }
      else {

        //console.log(postt);
        res.render("compose");
      }


    });


  }
  else {
    res.status(401).render("login", { errorMessage: "*Logging in to access compose page" });
    //res.redirect("/login");
  }

});


app.get("/posts/:postid", function (req, res) {
  //console.log(req.params.postName);
  if (req.isAuthenticated()) {
    var flag = 0;
    const requestedPostId = req.params.postid;
    Post.findOne({ _id: requestedPostId }, function (err, postt) {


      res.render("post", { obj: postt });

    });
  }
  else {
    res.status(401).render("login", { errorMessage: "*Please authenticate first" });
    //res.redirect("/login");
  }


});


app.get("/", function (req, res) {
  res.render("home2");
})

app.get("/register", function (req, res) {

  res.status(401).render("register", { errorMessage: "" });

})

app.get("/login", function (req, res) {
  res.status(401).render("login", { errorMessage: "" });
})
app.get("/subscribe", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("subscribe");
  }
  else {
    res.status(401).render("login", { errorMessage: "*Logging in to access  subscribe page" });
    //res.redirect("/login");
  }
})


app.get("/logout", (req, res) => {
  req.logout(req.user, err => {
    if (err) return next(err);
    res.redirect("/");
  });
});

/*
console.log(process.env.mongoUrl);
console.log(process.env.sessionSec);
console.log(process.env.mailchimpUrl );
console.log(process.env.mailchimpAuth);

*/



// -------------------------------------------------------    post --------------------------------------------------------//


app.post("/compose", function (req, res) {

  const post = new Post({
    title: req.body.Title,
    postbody: req.body.Postbody

  });
  post.save(function (err) {

    if (!err) {

      res.redirect("/home");

    }

  });


});



app.post("/register", function (req, res) {

  User.register({ username: req.body.username }, req.body.password, function (err, user) {

    if (err) {

      // console.log("Error in registering.",err);
      res.status(401).render("register", { errorMessage: "*Please try again..." });

      // res.redirect("/register");

    } else {

      passport.authenticate("local")(req, res, function () {

        //console.log(user,101);
        // console.log("new user....");
        res.redirect("/home");

      });

    }
  });


});



app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function (err) {
    if (err) {
      // Handle login error
      res.status(401).render("login", { errorMessage: "*Invalid username or password" });
    } else {
      passport.authenticate("local", function (err, user, info) {
        if (err) {
          // Handle authentication error
          res.status(500).render("login", { errorMessage: "*Internal server error" });
        } else if (!user) {
          // Handle non-registered user
          res.status(401).render("register", { errorMessage: "*User not registered" });
        } else {
          // Successful authentication
          req.logIn(user, function (err) {
            if (err) {
              // Handle login error
              res.status(500).render("login", { errorMessage: "*Internal server error" });
            } else {
              // Redirect to home page
              res.redirect("/home");
            }
          });
        }
      })(req, res);
    }
  });


  /*
    req.login(user, function(err){
    if (err) {
     // console.log(err);
     res.status(401).render("register", { errorMessage: "Please authenticate first" });
  
     //res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        //console.log("old user....");


        res.redirect("/home");
      });
    }
  }); */


})





app.post("/subscribe", function (req, res) {

  const firstName = req.body.Name; //fName is my name value in signup.html for first name input
  const lastName = req.body.UniversityName; //lName is my name value in signup.html for last name input
  const email = req.user.username;  //email is my name value in signup.html for email input
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  const jsonData = JSON.stringify(data);

  //You need to input your server number and list ID where I wrote YOURSERVERNUMBER and YOURLISTID

  const url = process.env.mailchimpUrl;
  const options = {
    method: "POST",

    //You need to input YOURAPIKEY between the quotes, you can also change whatevername1

    auth: process.env.mailchimpAuth
  };

  const request = https.request(url, options, function (response) {

    if (response.statusCode === 200) {
      //console.log("submitted");
      res.render("submit", { status: "Subscribe Sucessfullly..." });
    }
    else {
      //console.log("NOT submitted");
      res.render("submit", { status: "*Subscribe Sucessfullly" });
    }


    response.on("data", function (data) {
      //console.log(JSON.parse(data));
    });
  });
  request.write(jsonData);
  request.end();
});



























app.post("/contact", function (req, res) {


  Mentor.findOne({ mail: req.user.username }, function (err, postt) {

    if (postt != null) {
      res.render("submit", { status: "You already submitted.We will reach you as soon as possible via your Mobile Number." });
    }
    else {
      const mantor = new Mentor({
        phone: req.body.phone,
        mail: req.user.username,
        topic: req.body.topic
      })
      mantor.save(function (err, result) {
        if (err) {
          console.log(err);
          res.render("submit", { status: "pls try again later" });
        }
        else {


          console.log(result)
          res.render("submit", { status: "Submit Sucessfullly..." });
        }
      })
    }



  });

})



app.post("/submit", function (req, res) {
  res.redirect("/home");
})



// listen........

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started on port 3000");
});
