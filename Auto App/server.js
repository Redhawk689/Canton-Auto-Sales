const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "cars.json");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function readCars() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeCars(cars) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(cars, null, 2), "utf8");
}

app.get("/cars", (req, res) => {
  res.json(readCars());
});

app.post("/cars", (req, res) => {
  const cars = readCars();
  const nextId = cars.reduce((max, c) => Math.max(max, c.id), 0) + 1;
  const car = { id: nextId, ...req.body };
  cars.push(car);
  writeCars(cars);
  res.status(201).json(car);
});

app.put("/cars/:id", (req, res) => {
  const id = Number(req.params.id);
  const cars = readCars();
  const index = cars.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }
  cars[index] = { ...cars[index], ...req.body, id };
  writeCars(cars);
  res.json(cars[index]);
});

app.delete("/cars/:id", (req, res) => {
  const id = Number(req.params.id);
  const cars = readCars();
  const filtered = cars.filter(c => c.id !== id);
  writeCars(filtered);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "cars.json");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serves index.html and images

function readCars() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeCars(cars) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(cars, null, 2), "utf8");
}

// GET all cars
app.get("/cars", (req, res) => {
  res.json(readCars());
});

// CREATE car
app.post("/cars", (req, res) => {
  const cars = readCars();
  const nextId = cars.reduce((max, c) => Math.max(max, c.id), 0) + 1;
  const car = { id: nextId, ...req.body };
  cars.push(car);
  writeCars(cars);
  res.status(201).json(car);
});

// UPDATE car
app.put("/cars/:id", (req, res) => {
  const id = Number(req.params.id);
  const cars = readCars();
  const index = cars.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: "Not found" });
  cars[index] = { ...cars[index], ...req.body, id };
  writeCars(cars);
  res.json(cars[index]);
});

// DELETE car
app.delete("/cars/:id", (req, res) => {
  const id = Number(req.params.id);
  const cars = readCars();
  const filtered = cars.filter(c => c.id !== id);
  writeCars(filtered);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});