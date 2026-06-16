const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
require("dotenv").config();

const sampleUsers = [
  { name: "Ahmed Hassan", email: "ahmed.hassan@gmail.com", password: "123456", role: "user" },
  { name: "Sara Mohamed", email: "sara.mohamed@gmail.com", password: "123456", role: "user" },
  { name: "Omar Khaled", email: "omar.khaled@gmail.com", password: "123456", role: "user" },
  { name: "Fatima Ali", email: "fatima.ali@gmail.com", password: "123456", role: "user" },
  { name: "Youssef Ibrahim", email: "youssef.ibrahim@gmail.com", password: "123456", role: "user" },
  { name: "Nour Elsayed", email: "nour.elsayed@gmail.com", password: "123456", role: "admin" },
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashPassword = await bcrypt.hash(userData.password, 10);
        await User.create({ ...userData, password: hashPassword });
        console.log(`✓ Created user: ${userData.name}`);
      } else {
        console.log(`- User already exists: ${userData.name}`);
      }
    }

    console.log("\n✅ Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
