import express from "express";
import { adminOnly } from "../middleware/auth.js";
import {
    createPost,
    deleteImage,
    deletePost,
    getAllPosts,
    getSinglePost,
    updatePost,
    downloadPost,
} from "../controllers/post.js";
import { multiUpload } from "../middleware/multer.js";

const app = express.Router();

app.post("/createpost", adminOnly, multiUpload, createPost);
app.get("/getAllPosts", getAllPosts);
app.delete("/deleteImage", deleteImage);
app.get("/download", downloadPost);
app.get("/:postId", getSinglePost);

app
    .route("/:postId", adminOnly)
    .delete(deletePost)
    .put(multiUpload, updatePost);

export default app;
