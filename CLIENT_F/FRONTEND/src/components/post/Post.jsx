import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState, useEffect } from "react";
import axios from "axios";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [liked, setLiked] = useState(false); // Will update after fetching
  const [likesCount, setLikesCount] = useState(0);

  // Assume userId from localStorage or context
  const currentUserId = localStorage.getItem("userId"); // Or from context

  // Fetch like status and like count on mount
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/likes/${post.id}`
        );
        setLikesCount(res.data.totalLikes || 0);
        setLiked(res.data.likedBy.includes(Number(currentUserId))); // Check if current user liked it
      } catch (err) {
        console.error("Failed to load likes:", err);
      }
    };

    fetchLikes();
  }, [post.id, currentUserId]);

  // Inside Post component, below handleLike
  const handleShare = async () => {
    try {
      const res = await axios.post(`http://localhost:5001/API_B/posts`, {
        originalPostId: post.id,
        sharedByUserId: currentUserId,
      });

      alert("Post shared successfully!");
      // Optionally, update the UI or redirect
    } catch (err) {
      console.error("Failed to share post:", err);
      alert("Failed to share the post.");
    }
  };

  // Like or unlike the post
  const handleLike = async () => {
    try {
      if (liked) {
        await axios.delete(`http://localhost:5001/api/likes/${post.id}`, {
          data: { userId: currentUserId },
        });
        setLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        await axios.post(`http://localhost:5001/api/likes`, {
          postId: post.id,
          userId: currentUserId,
        });
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={post.profilePic} alt="" />
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name}</span>
              </Link>
              <span className="date">
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          <MoreHorizIcon />
        </div>
        <div className="content">
          <p>{post.desc}</p>
          {post.img && <img src={post.img} alt="" />}
        </div>
        <div className="info">
          <div className="item" onClick={handleLike}>
            {liked ? <FavoriteOutlinedIcon /> : <FavoriteBorderOutlinedIcon />}
            {likesCount} Likes
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            Comments
          </div>
          <div className="item" onClick={handleShare}>
            <ShareOutlinedIcon />
            Share
          </div>
        </div>
        {commentOpen && <Comments postId={post.id} />}
      </div>
    </div>
  );
};

export default Post;
