import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./posts.scss";

const Posts = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const [approvedRes, pendingRes] = await Promise.all([
        axios.get("http://localhost:8800/API_B/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get("http://localhost:8800/API_B/posts/pending-posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);
      setApprovedPosts(approvedRes.data);
      setPendingPosts(pendingRes.data);
      setError("");
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  const reviewPost = async (postId, action) => {
    const confirmResult = await Swal.fire({
      title: `Are you sure you want to ${action} this post?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: "Cancel",
    });

    if (confirmResult.isConfirmed) {
      try {
        await axios.post(
          "http://localhost:8800/API_B/posts/review",
          { postId, action },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Swal.fire("Success", `Post ${action}ed successfully`, "success");
        fetchPosts();
      } catch (err) {
        console.error(`Error ${action} post:`, err);
        setError(`Failed to ${action} post.`);
        Swal.fire("Error", `Failed to ${action} post.`, "error");
      }
    }
  };

  const deletePost = async (postId) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure you want to delete this post?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (confirmResult.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8800/API_B/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire("Deleted!", "Post has been deleted.", "success");
        fetchPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
        setError("Failed to delete post.");
        Swal.fire("Error", "Failed to delete post.", "error");
      }
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="posts">
      <h1>Manage Posts</h1>
      <div className="tabs">
        <button
          className={activeTab === "pending" ? "tab active" : "tab"}
          onClick={() => setActiveTab("pending")}
        >
          Pending Posts
        </button>
        <button
          className={activeTab === "approved" ? "tab active" : "tab"}
          onClick={() => setActiveTab("approved")}
        >
          Approved Posts
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Author</th>
              <th>Post</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === "pending" ? pendingPosts : approvedPosts).map(
              (post) => (
                <tr key={post._id || post.id}>
                  <td>{post.name || "Unknown"}</td>
                  <td>{post.desc}</td>
                  <td>{new Date(post.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="action-buttons">
                      {activeTab === "pending" ? (
                        <>
                          <button
                            className="approve"
                            onClick={() => reviewPost(post._id, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="reject"
                            onClick={() => reviewPost(post._id, "declined")}
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <button
                          className="reject"
                          onClick={() => deletePost(post.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            )}
            {(activeTab === "pending" && pendingPosts.length === 0) ||
            (activeTab === "approved" && approvedPosts.length === 0) ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No {activeTab} posts.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Posts;
