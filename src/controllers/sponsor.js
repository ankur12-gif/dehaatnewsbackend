import { TryCatch } from "../middleware/error.js";
import { Sponsors } from "../models/sponsor.js";
import { myCache, TTL } from "../../app.js";
import { uploadToImageKit, deleteFromImageKit } from "../utils/features.js"; // ✅ Use ImageKit

const createSponsor = TryCatch(async (req, res) => {
    const { name } = req.body;
    const photos = req.files;

    if (!photos) return next(new Error("Please upload photos", 400));
    if (!name) return next(new Error("Please enter all fields"));

    const photosUrl = await uploadToImageKit(photos); // ✅ Upload to ImageKit

    const sponsor = await Sponsors.create({ name, photos: photosUrl });
    myCache.del("allSponsors");

    return res.status(201).json({ success: true, message: "Sponsor created successfully" });
});

const deleteSponsor = TryCatch(async (req, res, next) => {
    const { sponsorId } = req.params;
    myCache.del("allSponsors");

    const sponsor = await Sponsors.findById(sponsorId);
    if (!sponsor) return next(new Error("Sponsor does not exist", 400));

    const ids = sponsor.photos.map((i) => i.public_id);
    await deleteFromImageKit(ids); // ✅ Delete from ImageKit

    await Sponsors.deleteOne({ _id: sponsorId });
    myCache.del("allSponsors");

    return res.status(200).json({ success: true, message: "Sponsor deleted successfully" });
});

const getAllSponsors = TryCatch(async (req, res, next) => {
    const cachedSponsors = myCache.get("allSponsors");
    if (cachedSponsors) {
        return res.status(200).json({ success: true, sponsors: cachedSponsors });
    }

    const sponsors = await Sponsors.find({}).sort({ createdAt: -1 });
    myCache.set("allSponsors", sponsors, TTL);

    return res.status(200).json({ success: true, sponsors });
});

export { createSponsor, deleteSponsor, getAllSponsors };
