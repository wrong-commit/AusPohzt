const express = require('express')
var session = require('express-session')
import api from "./src/services/api.ts"



const app = express()
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    unset: 'destroy'
  }));
//   app.use(passport.initialize());
//   app.use(passport.session());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/dist/index.html');
  })

app.get('/fetchPost', (req.res) => {
    api.get()
    .then(() => {
        MongoDB
    })
})