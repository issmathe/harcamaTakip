const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const database = require('./database.js');
const denemeRoute=require("./routes/denemes.js")  
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

const PORT = process.env.PORT ||  5000;

app.use("/api",denemeRoute)

app.listen(PORT, () => {
database()
  console.log(`Server is running on port ${PORT}`);
});
