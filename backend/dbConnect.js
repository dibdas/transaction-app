const mongoose = require("mongoose");
const mongoUrI = `mongodb+srv://dibdas:FEVCckip2Ts5Njw7@cluster0.hrhcs.mongodb.net/?retryWrites=true&w=majority`;

async function connecting() {
  try {
    const connectMan = await mongoose.connect(mongoUrI, {
      dbName: "Cluster0",
    });
    console.log(`mongoose connected.. ${connectMan.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit process if connection fails

    process.exit(1);
  }
}
module.exports = { connecting };
