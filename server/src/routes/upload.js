import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { requireAuth, requireBusiness } from "../auth/middleware.js";

export const uploadRouter = Router({ mergeParams: true });
uploadRouter.use(requireAuth, requireBusiness);

const configured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

uploadRouter.post("/upload", upload.single("file"), async (req, res) => {
  if (!configured) return res.status(503).json({ error: "Serviço de upload não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET." });
  if (!req.file) return res.status(400).json({ error: "Nenhum ficheiro enviado." });

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `vendasb2b/${req.params.businessId}`, transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }] },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ error: "Erro ao fazer upload da imagem." });
  }
});
