import multer from "multer";

const multerUpload = multer({ limits: { fileSize: 1024 * 1024 * 10 } });

export const singleUpload = multerUpload.single("photo");

export const multiUpload = multerUpload.array("photos", 5);
