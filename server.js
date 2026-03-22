const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "cars.json");


if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Missing STRIPE_SECRET_KEY environment variable");
}

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


app.post("/create-checkout-session", async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "$1 Test Item",
            },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success.html`,
      cancel_url: `${baseUrl}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});