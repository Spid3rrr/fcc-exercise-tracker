// create express app and serve home.html

const express = require("express");

const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/home.html");
});

// free tier database, no persistence, don't judge me
// yes, in a more organized project, we would use a db with proper tables, with the exercices and users seperated
// we would also use different files for routing
// alas, this is a simple project

user_db = [];

app.get("/api/users", (req, res) => {
  res.json(user_db.map((user) => ({ _id: user._id, username: user.username })));
});

app.post("/api/users", (req, res) => {
  const username = req.body.username;
  if (!username) {
    res.status(400).send("Username is required");
    return;
  }

  for (let i = 0; i < user_db.length; i++) {
    if (user_db[i].username === username) {
      res.status(400).send("Username already exists");
      return;
    }
  }

  const id = generateId();
  user_db.push({ _id: id, username: username, exercices: [] });
  console.log(id, username);
  res.json({ _id: id, username: username });
});

app.get("/api/users/:id/logs", (req, res) => {
  const id = req.params.id;
  const user = user_db.find((user) => user._id === id);

  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  console.log(id,from, to, limit);

  let exercices = user.exercices;

  if (from) {
    exercices = exercices.filter((exercice) => exercice.date >= from);
  }

  if (to) {
    exercices = exercices.filter((exercice) => exercice.date <= to);
  }

  if (limit) {
    exercices = exercices.slice(0, limit);
  }

  responseExercices = exercices.map((exercice) => ({
    description: exercice.description,
    duration: exercice.duration,
    date: exercice.date.toDateString(),
  }));

  res.json({
    _id: user._id,
    username: user.username,
    count: exercices.length,
    log: responseExercices,
  });
});

app.post("/api/users/:id/exercices", (req, res) => {
  const id = req.params.id;
  const user = user_db.find((user) => user._id === id);
//   if (!user) {
//     res.status(404).send("User not found");
//     return;
//   }

  const description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;

  console.log(id,description, duration, date);

  if (!description || !duration) {
    res.status(400).send("Description and duration are required");
    return;
  }

  if (typeof description !== "string") {
    res.status(400).send("Description must be a string");
    return;
  }

  if (isNaN(duration)) {
    res.status(400).send("Duration must be a number");
    return;
  }

  duration = parseInt(duration);

  if (!date) {
    date = new Date();
  }

  const exerciceObject = {
    description: description,
    duration: duration,
    date: date,
  };
  user.exercices.push(exerciceObject);
  res.json({
    description: description,
    duration: duration,
    date: date.toDateString(),
    username: user.username,
    _id: user._id,
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000");
});

var generateId = () => {
  var id = "";
  var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 24; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
};
