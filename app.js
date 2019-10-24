// init project
const express = require("express"),
      app = express(),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      methodOverride = require("method-override"),
      expressSanitizer = require("express-sanitizer");

// App Config
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


// Mongoose/Model Config
const blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Restful Routes

app.get("/", function(req, res) {
  res.redirect("/blogs");
})

// INDEX Route (Restful) - Displays all blogs
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs){
    if(err) {
      console.log(err);
    } else {
      res.render("index", {blogs: blogs});
    }
  }); 
});

// NEW Route (Restful) - Shows from to create new blog post
app.get("/blogs/new", function(req, res) {
  res.render("new");
});

// CREATE Route (Restful) - Create new blog post, then redirect to blog index
app.post("/blogs", function(req, res) {
  // create blog
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, newBlog) {
    if(err) {
      res.render("new");
    } else {
      // then, redirect to the index
      res.redirect("/blogs");
    }
  });
});

// SHOW Route
app.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if(err) {
      res.redirect("/blogs");
    } else {
      res.render("show", {blog: foundBlog});
    }
  })
})

//EDIT Route
app.get("/blogs/:id/edit", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if(err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", {blog: foundBlog});
    }
  })
});

// UPDATE Route
app.put("/blogs/:id", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,updateBlog) {
    if(err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  })
});

// DELETE Route
app.delete("/blogs/:id", function(req, res) {
  //destroy blog
  Blog.findByIdAndRemove(req.params.id, function(err){
    if(err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs")
    }
  })
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
