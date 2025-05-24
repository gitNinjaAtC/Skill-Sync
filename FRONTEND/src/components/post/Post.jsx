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
        //setLikedBy(res.data);
        setLikesCount(res.data.length);
        setLiked(res.data.some((user) => user.id === currentUser?.id));
      } catch (err) {
        console.error("Failed to fetch likes:", err);
      }
    };

    fetchLikes();
  }, [post.id, currentUser?.id]);

  useEffect(() => {
    if (post?.id) {
      fetchCommentsCount();
    }
  }, [post.id]);

  const handleLike = async () => {
    if (!currentUser) {
      alert("Please log in to like posts.");
      return;
    }

    try {
      // Check the current like status from the backend
      const response = await axios.get(
        `http://localhost:8800/API_B/likes/${post.id}/status`,
        { withCredentials: true }
      );
      const isLiked = response.data.liked;

      if (isLiked) {
        // Unlike the post
        await axios.delete(`http://localhost:8800/API_B/likes/${post.id}`, {
          withCredentials: true,
        });
        setLiked(false);
        setLikesCount((prev) => Math.max(prev - 1, 0));
        setLikedBy((prev) => prev.filter((user) => user.id !== currentUser.id));
      } else {
        // Like the post
        await axios.post(
          "http://localhost:8800/API_B/likes",
          { postId: post.id },
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
      if (
        err.response?.status === 400 &&
        err.response?.data === "Post already liked."
      ) {
        // Handle case where frontend state was out of sync
        setLiked(true);
        alert("Post is already liked.");
      } else if (
        err.response?.status === 404 &&
        err.response?.data === "Like not found"
      ) {
        // Handle case where user tries to unlike a post they haven't liked
        setLiked(false);
        alert("You haven't liked this post.");
      } else {
        alert("Failed to toggle like.");
      }
    }
  };

  const fetchCommentsCount = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8800/API_B/comments/${post.id}`,
        {
          withCredentials: true,
        }
      );
      setCommentsCount(res.data.length); // Update count based on number of comments
    } catch (err) {
      console.error(
        "Error fetching comments:",
        err.response?.data || err.message
      );
    }
  };

  const handleShare = () => {
    if (!currentUser) {
      alert("Please log in to share posts.");
      return;
    }

    // The link to the post (you may want to replace with actual post URL if available)
    const postUrl = `http://localhost:3000/post/${post.id}`; // replace with real frontend route if different
    const shareText = encodeURIComponent(`Check out this post: ${post.desc}`);
    const shareLink = encodeURIComponent(postUrl);

    // You can modify this to open different platforms — here's an example with WhatsApp:
    const whatsappUrl = `https://wa.me/?text=${shareText}%20${shareLink}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareLink}`;

    // You can choose one platform to open, or show a UI with options
    window.open(whatsappUrl, "_blank");
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
