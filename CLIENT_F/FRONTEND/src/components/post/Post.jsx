import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";

const Post = ({ post }) => {
  const { currentUser, loading } = useContext(AuthContext);
  const [commentOpen, setCommentOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [likedBy, setLikedBy] = useState([]);
  const [showLikedBy, setShowLikedBy] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8800/API_B/likes/${post.id}`,
          { withCredentials: true }
        );
        setLikesCount(res.data.totalLikes || 0);
        setLiked(res.data.likedBy.some((user) => user.id === currentUser?.id));
        setLikedBy(res.data.likedBy); // Array of { id, name }
      } catch (err) {
        console.error(
          "Failed to load likes:",
          err.response?.data || err.message
        );
      }
    };

    if (currentUser && !loading) {
      fetchLikes();
    }
  }, [post.id, currentUser, loading]);

  const handleLike = async () => {
    if (!currentUser) {
      alert("Please log in to like posts.");
      return;
    }

    try {
      if (liked) {
        await axios.delete(`http://localhost:8800/API_B/likes/${post.id}`, {
          data: { userId: currentUser.id },
          withCredentials: true,
        });
        setLiked(false);
        setLikesCount((prev) => prev - 1);
        setLikedBy((prev) =>
          prev.filter((user) => user.id !== currentUser.id)
        );
      } else {
        await axios.post(
          "http://localhost:8800/API_B/likes",
          {
            postId: post.id,
            userId: currentUser.id,
          },
          { withCredentials: true }
        );
        setLiked(true);
        setLikesCount((prev) => prev + 1);
        setLikedBy((prev) => [
          ...prev,
          { id: currentUser.id, name: currentUser.name },
        ]);
      }
    } catch (err) {
      console.error("Error toggling like:", err.response?.data || err.message);
      alert("Failed to toggle like.");
    }
  };

  const handleShare = async () => {
    if (!currentUser) {
      alert("Please log in to share posts.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8800/API_B/posts",
        {
          desc: `Shared: ${post.desc}`,
          originalPostId: post.id,
          userId: currentUser.id,
        },
        { withCredentials: true }
      );
      alert(res.data.message || "Post shared successfully!");
      if (res.data.message === "Post created successfully") {
        setTimeout(() => window.location.reload(), 3000);
      }
    } catch (err) {
      console.error("Failed to share post:", err.response?.data || err.message);
      alert("Failed to share the post.");
    }
  };

  if (loading) {
    return <div className="post">Loading...</div>;
  }

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={post.profilePic || "/default-avatar.png"} alt="" />
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name || "User"}</span>
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
          <div
            className="item"
            onClick={handleLike}
            onMouseEnter={() => setShowLikedBy(true)}
            onMouseLeave={() => setShowLikedBy(false)}
          >
            {liked ? <FavoriteOutlinedIcon /> : <FavoriteBorderOutlinedIcon />}
            {likesCount} Likes
            {showLikedBy && likedBy.length > 0 && (
              <div className="likedByTooltip">
                {likedBy.map((user) => (
                  <span key={user.id}>{user.name}</span>
                ))}
              </div>
            )}
          </div>

          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            {commentsCount} Comments
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
