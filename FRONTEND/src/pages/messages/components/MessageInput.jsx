import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import "./messageInput.scss";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { authUser } = useAuthStore(); // ✅ Get sender
  const { selectedUser, sendMessage } = useChatStore(); // ✅ Get receiver

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type?.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      // ✅ Include senderId explicitly
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        senderId: authUser._id,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="message-input">
      {imagePreview && (
        <div className="image-preview">
          <div className="preview-wrapper">
            <img src={imagePreview} alt="Preview" />
            <button type="button" className="remove-btn" onClick={removeImage}>
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <form className="input-form" onSubmit={handleSendMessage}>
        <div className="input-group">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="file-input"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`image-btn ${imagePreview ? "active" : ""}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button type="submit" className="send-btn" disabled={!text.trim() && !imagePreview}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
