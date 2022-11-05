const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = 'mongodb+srv://demo:demopassword@cluster0.wqhjxcd.mongodb.net/?retryWrites=true&w=majority';
const dbName = "coinflipgame";




MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
  if(error) {
      throw error;
  }
  db = client.db(dbName);
  console.log("Connected to `" + dbName + "`!");
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  db.collection('results').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result})
  })
})

app.post('/results', (req, res) => {

  let coinFlipResult = Math.ceil(Math.random() * 2);
  let comResult;
  let userInput = req.body.userPlay.toLowerCase()

  if (userInput == 'heads' || userInput == 'tails') {
    if (coinFlipResult <= 1) {
      comResult = "heads";
    } else if (coinFlipResult <= 2) {
      comResult = "tails";
    }
    let outcome;
    if (comResult === req.body.userPlay) {
      outcome = "Winner!";
    } else {
      outcome = "Loser!";
    }
  
    db.collection("results").insertOne(
      {
        userPlay: req.body.userPlay,
        coinFlipResult: comResult,
        winOrLoss: outcome,
          
      },
      (err, result) => {
        if (err) return console.log(err);
        console.log("saved to database");
        res.redirect("/");
      }
    );
  }
});


//   db.collection('messages').insertOne({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
//     if (err) return console.log(err)
//     console.log('saved to database')
//     res.redirect('/')
//   })
// })

app.put('/results', (req, res) => {
  db.collection('results')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/results', (req, res) => {
  db.collection('results').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})

app.listen(8080, () => {
console.log('listening on 8080')
});