// src/components/post/Post.jsx
import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/authContext";
import PostSkeleton from "./PostSkeleton";
import defaultAvatar from "../../assets/avatar.png";
import { makeRequest } from "../../axios";

const Post = ({ post }) => {
  const { currentUser, loading } = useContext(AuthContext);

  const [commentOpen, setCommentOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [likedBy, setLikedBy] = useState([]);
  const [showLikedBy, setShowLikedBy] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCommentsCount = async () => {
    try {
      const res = await makeRequest.get(`/API_B/comments/${post.id}`);
      setCommentsCount(res.data.length);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await makeRequest.get(`/API_B/likes/${post.id}`);
        setLikesCount(res.data.length);
        setLiked(res.data.some((user) => user.id === currentUser?.id));
        setLikedBy(res.data);
      } catch (err) {
        console.error("Failed to fetch likes:", err);
      }
    };

    if (post?.id) fetchLikes();
  }, [post.id, currentUser?.id]);

  useEffect(() => {
    if (post?.id) fetchCommentsCount();
  }, [post.id]);

  const handleLike = async () => {
    if (!currentUser) return alert("Please log in to like posts.");
    try {
      const response = await makeRequest.get(`/API_B/likes/${post.id}/status`);
      const isLiked = response.data.liked;

      if (isLiked) {
        await makeRequest.delete(`/API_B/likes/${post.id}`);
        setLiked(false);
        setLikesCount((prev) => Math.max(prev - 1, 0));
        setLikedBy((prev) => prev.filter((user) => user.id !== currentUser.id));
      } else {
        await makeRequest.post(`/API_B/likes`, { postId: post.id });
        setLiked(true);
        setLikesCount((prev) => prev + 1);
        setLikedBy((prev) => [
          ...prev,
          { id: currentUser.id, name: currentUser.name },
        ]);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Failed to toggle like.");
    }
  };

  const handleShare = () => {
    if (!currentUser) return alert("Please log in to share posts.");
    const postUrl = `https://skill-sync-frontend.onrender.com/post/${post.id}`;
    const shareText = encodeURIComponent(`Check out this post: ${post.desc}`);
    const shareLink = encodeURIComponent(postUrl);
    const whatsappUrl = `https://wa.me/?text=${shareText}%20${shareLink}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;
    try {
      await makeRequest.delete(`/API_B/posts/${post.id}`);
      alert("Post deleted successfully.");
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Error deleting post.");
    }
  };

  if (loading) return <PostSkeleton />;

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img
              src={
                post.profilePic && post.profilePic.trim() !== ""
                  ? post.profilePic.startsWith("http")
                    ? post.profilePic
                    : `https://skill-sync-backend-522o.onrender.com${post.profilePic}`
                  : defaultAvatar
              }
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
              alt="User"
            />
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name || "User"}</span>
              </Link>
              <span className="date">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="options" ref={optionsRef}>
            <MoreHorizIcon
              style={{ cursor: "pointer" }}
              onClick={() => setShowOptions((prev) => !prev)}
            />
            {showOptions && currentUser?.id === post.userId && (
              <button className="deleteBtn" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
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
