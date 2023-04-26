const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const routes = require("./routes")
require('dotenv').config()

const app = express()
// app.use(cors)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


routes(app)
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Successfully Connected!'))
    .catch(() => console.log('Connected failed!'))

const port = process.env.PORT
app.listen(port, () => {
    console.log("server is running!")
})