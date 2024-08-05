const express = require("express");
const routes = require("express").Router();
const formidable = require('formidable')

const app = express();
const cors = require('cors');

app.use(express.static(path.join(__dirname, "uploads")));


const paymentRoutes = require("./routes/payments");

let port = 8009;

app.use(routes);
app.use(cors());

routes.use("/", paymentRoutes);

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is running on port ${port}`);
  }
});
