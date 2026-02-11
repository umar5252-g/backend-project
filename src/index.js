// require('dotenv').config({path: './env'})

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";

import express from "express";
const app = express();

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERRR: ", error);
      throw error;
    });

    console.log("Mongo ready state:", mongoose.connection.readyState);

    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`o server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongodb connection failed !!!");
  });

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("ERROR ", error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`APP is listing on PORT: ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("ERROR:", error);
//     throw error;
//   }
// })();
