const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const dbAddress = process.env.DB_ADDRESS

mongoose.connect(dbAddress, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Successfully connected to DB.")
  }
});


const Schema = mongoose.Schema;
const PoemSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  keyword: {
    type: String,
    required: true,
    unique: true
  },
  body: {
    type: String,
    required: true
  },
  date_added: {
    type: Date,
    default: Date.now
  },
  last_edited: Date,
  tags: [String]
});

const Poem = mongoose.model('Poem', PoemSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get('/', function(req, res) {

  Poem.find({}, function(err, poems) {
    if (err) {
      console.log(err);
      res.render('error');
      return;
    } else {
      //compute the sections (each with 6 poems)
      let sections = Math.floor(poems.length / 6);
      if (poems.length % 6 !== 0) {
        sections++;
      };

      res.render("home", {
        poems: poems,
        sections: sections
      });
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
})

app.get('/poems/:keyword', function(req, res) {
  Poem.find({}, function(err, poems) {
    if (err) {
      console.log(err);
      res.render("error");
      return;
    } else {
      poems.forEach((poem, index) => {
        if (poem.keyword === req.params.keyword) {
          res.render("poem", {
            poem: poem,
            index: index,
            lastIndex: poems.length - 1
          });
          return;
        }
      })
    }
  })
});

app.get('/index/:i', function(req, res){
  Poem.find({}, function(err, poems){
    if(err){
      console.log(err);
      res.render("error");
      return;
    }else{
      const next = poems[req.params.i].keyword;
      res.redirect("/poems/" + next);
    }
  })
});

app.get("/subscribe", function(req, res){
  res.render("subscribe");
})

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
