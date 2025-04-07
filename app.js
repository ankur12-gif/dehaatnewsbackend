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
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Posts } from "./src/models/posts.js"; // <-- Added

dotenv.config({ path: "./.env" });
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT;

export let AdminPassKey;
export const jwtSecret = process.env.JWT_SECRET;
export const TTL = process.env.TIME_TO_LIVE;
export const envMode = process.env.NODE_ENV || "PRODUCTION";
const mongoUri = process.env.MONGO_URI;
export const myCache = new NodeCache();

app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, "client-dist")));

// ImageKit config
export const imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  urlEndpoint: process.env.URL_ENDPOINT,
});

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/posts", postsRoute);
app.use("/api/v1/sponsors", sponsorsRoute);

// Meta tag injector
const getHtmlWithMeta = ({ title, description, image, url }) => {
  const indexPath = path.join(__dirname, "client-dist", "index.html");
  let html = fs.readFileSync(indexPath, "utf-8");

  return html
    .replace(/{{TITLE}}/g, title)
    .replace(/{{DESCRIPTION}}/g, description)
    .replace(/{{IMAGE}}/g, image)
    .replace(/{{URL}}/g, url)
    .replace(/{{PUBLISHED_DATE}}/g, new Date().toISOString())
    .replace(/{{MODIFIED_DATE}}/g, new Date().toISOString());
};

// Dynamic Meta route for /viewfull/:id
app.get("/viewfull/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Posts.findById(id).lean();

    if (!post) {
      return res.status(404).send("Post not found");
    }

    const metadata = {
      title: post.title || "Dehaat News",
      description: post.description || "Latest update from Dehaat News",
      image: post.photos?.[0]?.url || `${process.env.CLIENT_URL}/dehaatnews.png`,
      url: `${process.env.CLIENT_URL}/viewfull/${id}`,
    };

    const html = getHtmlWithMeta(metadata);
    res.send(html);
  } catch (error) {
    console.error("Error generating meta:", error);
    res.status(500).send("Server error");
  }
});

// Catch-all route for SPA
app.get("*", (req, res) => {
  const html = getHtmlWithMeta({
    title: "Dehaat News - Stay Updated",
    description: "Get the latest agricultural and global updates.",
    image: `${process.env.CLIENT_URL}/dehaatnews.png`,
    url: `${process.env.CLIENT_URL}${req.originalUrl}`,
  });
  res.send(html);
});

// Start server
const initializeServer = async () => {
  try {
    AdminPassKey = await hashPassword(process.env.ADMIN_PASS_KEY);
    await connectToMongoDB(mongoUri);

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error initializing server:", error);
  }
};

initializeServer();
