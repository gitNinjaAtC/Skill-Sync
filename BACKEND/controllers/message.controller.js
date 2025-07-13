import User from "../models/Users.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// ========== GET USERS FOR SIDEBAR ==========
export const getUsersForSidebar = async (req, res) => {
  try {
    console.log("⚡ getUsersForSidebar hit"); // no `req.user._id` anymore

    const users = await User.find().select("-password");

    console.log("📤 Sending users:", users.map(u => ({ id: u._id, name: u.name })));

    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// ========== GET MESSAGES ==========
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const { senderId } = req.query; // You must pass this from frontend

    if (!userToChatId || !senderId) {
      return res.status(400).json({ error: "Both senderId and receiverId are required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// ========== SEND MESSAGE ==========
export const sendMessage = async (req, res) => {
  try {
    const { text, image, senderId } = req.body;
    const { id: receiverId } = req.params;

    if (!receiverId || !senderId) {
      return res.status(400).json({ error: "Both senderId and receiverId are required" });
    }

    if (!text && !image) {
      return res.status(400).json({ error: "Message must include text or image" });
    }

    let imageUrl = null;
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "chatImages",
      });
      imageUrl = uploadResult.secure_url;
    }

     const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl, // ✅ Save the uploaded Cloudinary URL
    });



    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
