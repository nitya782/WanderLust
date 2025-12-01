if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const dbUrl = process.env.ATLASDB_URL;
const MongoStore = require('connect-mongo');

const ejsMate = require("ejs-mate");
const ExpressError = require("./util/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const reviewRouter = require("./routes/review.js");
const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");

// Connect to MongoDB with retry logic (don't block app startup on connection failure)
async function connectDB() {
    const options = {
        tls: true,
        tlsAllowInvalidCertificates: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
    };
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(dbUrl, options);
        console.log("connected to DB");
    } catch (err) {
        console.error('DB connection failed:', err.message);
        console.log('Retrying in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
}

connectDB();

app.use(express.urlencoded({extended: true}));
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));

// Session store with fallback to memory store if MongoDB unavailable
let store;
try {
    store = MongoStore.create({
        mongoUrl : dbUrl,
        crypto : {
            secret: process.env.SECRET,
        },
        touchAfter: 24 * 3600,
    });
    store.on("error", (err) => {
        console.error("Error in MONGO SESSION STORE", err);
    });
} catch (err) {
    console.warn("MongoDB session store failed, using memory store:", err.message);
    store = new (require('express-session').Store)();
}

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave: false,
    saveUninitialized : true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});

//demo user 
// app.get("/demouser", async(req,res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });
app.get("/", (req, res) => {
  res.render("home");
});
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all(/.*/, (req,res,next) =>{
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    console.error("Error after headers sent:", err.message);
    return next(err);
  }
  console.error("Error caught in middleware:", err.message);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  try {
    res.status(statusCode).render("error.ejs", {message});
  } catch (renderErr) {
    console.error("Render error:", renderErr.message);
    res.status(statusCode).send(message);
  }
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});