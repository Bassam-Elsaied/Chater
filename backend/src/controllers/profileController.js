import User from "../models/Users.js";
import { cloudinary } from "../lib/cloudinary.js";

const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true },
    );

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { updateProfile };
