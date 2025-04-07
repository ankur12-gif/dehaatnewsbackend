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
import { Posts } from "./src/models/posts.js";

dotenv.config({ path: "./.env" });
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tell Express where to find static files like HTML, JS, CSS
app.use(express.static(path.join(__dirname, "client-dist")));


const PORT = process.env.PORT;

export let AdminPassKey;
export const jwtSecret = process.env.JWT_SECRET;
export const TTL = process.env.TIME_TO_LIVE;
export const envMode = process.env.NODE_ENV || "PRODUCTION";
const mongoUri = process.env.MONGO_URI;
export const myCache = new NodeCache();

const corsOptions = {
  // origin: [
  //   "http://localhost:5173",
  //   "http://localhost:4173",
  //   process.env.CLIENT_URL,"*"
  // ],
  //credentials: true,
  origin: "*"
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());


// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/posts", postsRoute);
app.use("/api/v1/sponsors", sponsorsRoute);

// ImageKit
export const imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  urlEndpoint: process.env.URL_ENDPOINT,
});

// HTML template loader
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

// Dynamic route for individual posts (example)
// Dynamic route for individual posts (SEO for social share)
app.get("/post/:slug", async (req, res) => {
  const slug = req.params.slug;

  try {
    // 1. Check cache first
    let post = myCache.get(slug);

    // 2. Fetch from DB if not in cache
    if (!post) {
      post = await Posts.findOne({ slug });

      if (!post) {
        return res.status(404).send("Post not found");
      }

      // 3. Cache the post (10 mins)
      myCache.set(slug, post, 600);
    }

    // 4. Prepare meta data
    const meta = {
      title: post.title,
      description: post.description,
      image: post.photos?.[0]?.url || `${process.env.CLIENT_URL}/dehaatnews.png`,
      url: `${process.env.CLIENT_URL}/post/${slug}`,
    };

    // 5. Inject and serve
    const html = getHtmlWithMeta(meta);
    res.send(html);
  } catch (err) {
    console.error("Error loading post for SEO:", err);
    res.status(500).send("Something went wrong");
  }
});

// Catch-all for React (client-side routing)
app.get("*", (req, res) => {
  const html = getHtmlWithMeta({
    title: "Dehaat News - Stay Updated",
    description: "Get the latest agricultural and global updates.",
    image: `${process.env.CLIENT_URL}/dehaatnews.png`,
    url: `${process.env.CLIENT_URL}${req.originalUrl}`,
  });
  res.send(html);
});

const initializeServer = async () => {
  try {
    AdminPassKey = await hashPassword(process.env.ADMIN_PASS_KEY);
    await connectToMongoDB(mongoUri);

    app.listen(PORT, () => {
      console.log(`App is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error initializing server:", error);
  }
};

initializeServer();
