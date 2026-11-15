import mongoose from "mongoose";
import User from "../models/Users.js";
import Message from "../models/message.js";
import { cloudinary } from "../lib/cloudinary.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const filterdUsers = await User.find({ _id: { $ne: loggedInUser } }).select(
      "-password",
    );

    res.status(200).json({ success: true, contacts: filterdUsers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getMessagesById = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: id },
        { senderId: id, receiverId: myId },
      ],
    });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const senderId = req.user._id;
    const receiverId = req.params.id;

    if (!text && !image) {
      return res
        .status(400)
        .json({ success: false, message: "Message text or image is required" });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot send message to yourself" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res
        .status(404)
        .json({ success: false, message: "Receiver not found" });
    }

    let imageUrl;

    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image);
      imageUrl = uploadedImage.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl || null,
    });

    await newMessage.save();

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getChats = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Find all messages where the logged-in user is either the sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatContactsId = [
      ...new Set(
        messages.map((message) => {
          if (message.senderId.toString() === loggedInUserId.toString()) {
            return message.receiverId.toString();
          }
          return message.senderId.toString();
        }),
      ),
    ];

    const chatContacts = await User.find({
      _id: { $in: chatContactsId },
    }).select("-password");

    res.status(200).json({ success: true, chats: chatContacts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
