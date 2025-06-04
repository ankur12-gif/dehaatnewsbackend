import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToMongoDB, hashPassword } from "./src/utils/features.js";
import userRoute from "./src/routes/admin.js";
import postsRoute from "./src/routes/post.js";
import sponsorsRoute from "./src/routes/sponsor.js";
import ImageKit from "imagekit";
import morgan from "morgan";
import NodeCache from "node-cache";
import axios from "axios";
// const path = require("path");
// const fs = require("fs");
import fs from "fs";
import path from "path";

dotenv.config({ path: "./.env" });

const app = express();

const PORT = process.env.PORT;
export let AdminPassKey;

export const jwtSecret = process.env.JWT_SECRET;
export const TTL = process.env.TIME_TO_LIVE;
export const envMode = process.env.NODE_ENV || "PRODUCTION";
const mongoUri = process.env.MONGO_URI;
export const myCache = new NodeCache();

console.log("CLIENT_URL:", process.env.CLIENT_URL);

// Setup CORS
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    process.env.CLIENT_URL,
    process.env.SERVER_URL,
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Initialize ImageKit
export const imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  urlEndpoint: process.env.URL_ENDPOINT,
});

app.get("/viewfull/:id", async (req, res) => {
  try {
    const { id } = req?.params; // ✅ This line is missing in your code

    // ✅ Use your backend API, not CLIENT_URL
    const apiResponse = await axios.get(
      `${process.env.SERVER_URL}/api/v1/posts/${id}`
    );

    console.log({ apiResponse });

    if (!apiResponse.data.success) {
      return res.status(404).send("Post not found");
    }

    const post = apiResponse?.data?.post;
    const title = escapeHTML(post?.title || "Untitled Post");
    const description = escapeHTML(
      post?.description || "Read this article on Dehaat News."
    );
    const rawImageUrl =
      post.imageUrl ||
      post.photos?.[0]?.url ||
      `${process.env.CLIENT_URL}/dehaatnews.png`;
    const imageUrl = escapeHTML(rawImageUrl);
    const pageUrl = `${process.env.CLIENT_URL}/viewfull/${id}`;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta name="description" content="${description}" />
        <meta property="og:image" content="${imageUrl}" />
        <!-- other meta tags -->
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(post)};
        </script>
        <script src="/static/js/main.js"></script>
           <script>
                window.location.href = "${pageUrl}";
            </script>
      </body>
    </html>
  `;

    res.send(html);
  } catch (error) {
    console.error("Error in /viewfull/:id:", error.message);
    res.status(500).send("Server Error");
  }
});

// Escape HTML for safe meta output
function escapeHTML(str) {
  return str
    ?.replace(/&/g, "&amp;")
    ?.replace(/</g, "&lt;")
    ?.replace(/>/g, "&gt;")
    ?.replace(/"/g, "&quot;")
    ?.replace(/'/g, "&#039;");
}

// Initialize MongoDB and Start Server
const initializeServer = async () => {
  try {
    AdminPassKey = await hashPassword(process.env.ADMIN_PASS_KEY);

    await connectToMongoDB(mongoUri);

    app.use("/api/v1/user", userRoute);
    app.use("/api/v1/posts", postsRoute);
    app.use("/api/v1/sponsors", sponsorsRoute);

    app.listen(PORT, () => {
      console.log(`🚀 App is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error initializing server:", error);
  }
};

initializeServer();
