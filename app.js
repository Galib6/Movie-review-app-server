const express = require("express");
require("express-async-errors")
const morgan = require("morgan");
const { errorHandler } = require("./middlewares/error");
const cors = require("cors")
require("dotenv").config()
require("./db/index")
const userRouter = require("./routes/user")


const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/user", userRouter);
app.use(cors())
app.use(errorHandler)



app.get("/", (req, res) => {
    res.send({ Ok: "server running" })
})

app.post("/sign-in",
    (req, res, next) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ error: "email or password missing" });
        }
        next()
    },
    (req, res) => {
        res.send("<h1>Hello from movie review ABOUT server</h1>")
    })


app.listen(5000, () => {
    console.log("this server is running on port: 5000")
})
