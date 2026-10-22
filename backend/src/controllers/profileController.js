import User from "../models/Users.js";
import { cloudinary } from "../lib/cloudinary.js";

const MAX_PROFILE_PIC_BYTES = 2 * 1024 * 1024;
export const profileTooLargeMessage = "Profile picture must be 2MB or smaller";

// Base64 is about 4/3 of the file, plus a little room for the JSON wrapper.
export const profileBodyLimit =
  Math.ceil(MAX_PROFILE_PIC_BYTES / 3) * 4 + 1024;

const DATA_URL =
  /^data:image\/(jpeg|jpg|png|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/i;

const INVALID_IMAGE =
  "Profile picture must be a JPEG, PNG, WebP, or GIF image";

const IMAGE_SIGNATURES = {
  jpeg: (buf) =>
    buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  png: (buf) =>
    buf.length >= 4 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47,
  gif: (buf) => {
    const header = buf.toString("ascii", 0, 6);
    return buf.length >= 6 && (header === "GIF87a" || header === "GIF89a");
  },
  webp: (buf) =>
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP",
};

const validateProfilePic = (profilePic) => {
  if (typeof profilePic !== "string" || profilePic.length === 0) {
    return { error: "Profile picture is required" };
  }

  const match = DATA_URL.exec(profilePic);
  if (!match || match[2].length % 4 !== 0) {
    return { error: INVALID_IMAGE };
  }

  const base64 = match[2];
  if (Buffer.byteLength(base64, "base64") > MAX_PROFILE_PIC_BYTES) {
    return { error: profileTooLargeMessage };
  }

  const declaredType =
    match[1].toLowerCase() === "jpg" ? "jpeg" : match[1].toLowerCase();
  const header = Buffer.from(base64.slice(0, 32), "base64");
  if (!IMAGE_SIGNATURES[declaredType](header)) {
    return { error: INVALID_IMAGE };
  }

  return { dataUri: profilePic };
};

const updateProfile = async (req, res) => {
  try {
    const profilePic = validateProfilePic(req.body?.profilePic);
    if (profilePic.error) {
      return res.status(400).json({ message: profilePic.error });
    }

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic.dataUri);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true },
    ).select("-password");

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    if (error.http_code === 400) {
      return res.status(400).json({ message: INVALID_IMAGE });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export { updateProfile };
