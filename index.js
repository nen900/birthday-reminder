

const messages = [
  "You just turned a year older, we hope you're feeling wiser, Happy birthday.",
  "Here's to another year round the sun, wishing you a day full of love and light. Happy birthday",
  "A new era has been unlocked, and we hope you're embracing it, H\\\\\\\\\\\\\\\\apppy birthday."
]
const USER = require("./userSchema.js"); 
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const express = require("express");
const cron = require("node-cron");
const path = require("path");

const app = express();
dotenv.config();

app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded ({extended: true }) ); 
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Database connected successfully"))
.catch(err => console.error("DB connection error:", err));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.PASSWORD,
  },
});

app.post("/", async(req, res) => {
  try {
    const { name, username, email, birthday} = req.body;

    const new_user = new USER({
      firstname: name,
      username: username,
      email,
      birthday,
    });

    await new_user.save();
    //res.status(200).send("user added sucessfuly");
    res.redirect("/success.html");
  } catch(err) {
    console.error(err);
    res.status(400).send("see error:" + err.message);
  }

});

cron.schedule("* 6 * * *", async () => {
  try {
    
    const today = new Date();
    const month_today = today.getMonth() + 1;
    const day_today = today.getDate();

    const bday_today = await USER.aggregate([
      {
        $project: {
          firstname: 1,
          email: 1,
          month: { $month: "$birthday" },
          day: { $dayOfMonth: "$birthday" },
        }
      },
      {
        $match: {
          month: month_today,
          day: day_today,
        }
      },
    ]);

    for(let person of bday_today) {

      const bday_text = messages[Math.floor(Math.random() * messages.length)];

      await transporter.sendMail({
        from: `"Moe Jon" <${process.env.EMAIL_ADDRESS}>`,
        to: person.email,
        subject: `It's your big day ${person.firstname}!`,
        text: `HI ${person.firstname}. ${bday_text}`,
      })
    }
  } catch (err) {
    console.error("error message is:" + err);
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


