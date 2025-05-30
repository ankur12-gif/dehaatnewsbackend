import fs from "fs";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import ImageKit from "imagekit";
import NodeCache from "node-cache";
import { fileURLToPath } from "url";

import { connectToMongoDB, hashPassword } from "./src/utils/features.js";
import userRoute from "./src/routes/admin.js";
import postsRoute from "./src/routes/post.js";
import sponsorsRoute from "./src/routes/sponsor.js";

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

app.use(express.static(path.join(__dirname, "./dist")));
// ++
app.get(/^(?!\/api).\*/, (req, res) => {
  res.sendFile(path.join(__dirname, "./dist", "index.html"));
});

// Initialize ImageKit
export const imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  urlEndpoint: process.env.URL_ENDPOINT,
});

// 🔹 Open Graph Meta Route for Social Sharing
app.get("/viewfull/:id", async (req, res) => {
  const indexPath = path.join(__dirname, "./dist", "index.html");

  fs.readFile(indexPath, "utf8", (err, htmlData) => {
    if (err) {
      console.error("Error during file reading", err);
      return res.status(404).end();
    }
    let fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
    console.log({ fullUrl });

    const { id } = req?.params;

    return fetch(`${process.env.SERVER_URL}/api/v1/posts/${id}`)
      .then((response) =>
        response.json().then((data) => {
          console.log({ data });
          const post = data?.post;

          // const title = escapeHTML(post?.title || "Untitled Post");
          const title = post?.title;
          const description = escapeHTML(
            post.description || "Read this article on Dehaat News."
          );
          const rawImageUrl =
            post?.photos?.[0]?.url ||
            `${process.env.CLIENT_URL}/dehaatnews.png`;

          const imageUrl = rawImageUrl;

          // inject meta tags
          htmlData = htmlData
            .replace(
              /Dehaat News - Stay Updated/g,
              title || "Dehaat News - Stay Updated"
            )
            .replace("__META_OG_URL__", fullUrl)
            .replace(
              /Stay updated with agricultural and global news./g,
              description || "Stay updated with agricultural and global news."
            )
            .replace("__META_IMAGE__", imageUrl);

          return res.send(htmlData);
        })
      )
      .catch((err) => {
        console.log({ err });
        return res.send(htmlData);
      });
  });
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
