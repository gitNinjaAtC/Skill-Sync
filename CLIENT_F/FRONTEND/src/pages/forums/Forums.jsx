import React from "react";
import "./forums.scss";
import Forum from "../../assets/forums.png";
import { useNavigate } from "react-router-dom";

const Forums = () => {
  const navigate = useNavigate();
  const forumPosts = [
    {
      title:
        "Maxop Engineering Co. Pvt. Ltd. – MAXOP – Campus Placement Drive – 2025 Batch Recruitment Event Experiences",
      createdAgo: "2 months ago",
      description:
        "This post has been created for all the students to share and discuss the Recruitment Event conducted for Maxop Engineering Co. Pvt. Ltd.",
      tags: [
        "Placement Event",
        "On Campus",
        "Interviews Experience",
        "Recruitment Experience",
        "MAXOP – Campus Placement Drive",
        "Maxop Engineering Co. Pvt. Ltd.",
        "2025",
      ],
      interviewExperience: {
        name: "Kaishav Kumar",
        qa: [
          {
            question: "For what role was the interview conducted?",
            answer: "Trainee engineer",
          },
          {
            question: "What was their selection and interview process like?",
            answer:
              "In my words, The process depends on the resume and in my interview questions are taken from my past project and activities.",
          },
        ],
      },
    },
    {
      title:
        "Pay1India Payment Solutions – Customer Support Executive – 2024 Batch Recruitment Experience",
      createdAgo: "1 year ago",
      description:
        "Students shared their experience attending the placement drive by Pay1India for a Customer Support Executive role.",
      tags: [
        "Customer Support",
        "Off Campus",
        "Recruitment Experience",
        "Pay1India",
        "2024",
      ],
      interviewExperience: {
        name: "Sneha Raj",
        qa: [
          {
            question: "For what role was the interview conducted?",
            answer: "Customer Support Executive",
          },
          {
            question: "What was the difficulty level of the interview?",
            answer:
              "The questions were mostly related to communication skills and situational judgment. It was fairly easy.",
          },
        ],
      },
    },
  ];

  const handlecreateForum = () => {
    navigate("/create-forum"); // Navigate to the Create Forum page
  };

  return (
    <div className="forum-container">
      <div className="item">
      <img src={Forum} alt="" />
      <span>Forums</span>
      </div>
      

      {forumPosts.map((post, i) => (
        <div key={i} className="forum-card">
          <p className="timestamp">{post.createdAgo}</p>
          <h2 className="title">{post.title}</h2>
          <p className="description">{post.description}</p>

          <div className="tags">
            {post.tags.map((tag, idx) => (
              <span key={idx}>{tag}</span>
            ))}
          </div>

          <div className="interview-section">
            <p className="interview-name">
              {post.interviewExperience.name} shared interview experience
            </p>
            {post.interviewExperience.qa.map((item, index) => (
              <div key={index} className="qa-pair">
                <p className="question">Q. {item.question}</p>
                <p className="answer">A. {item.answer}</p>
              </div>
            ))}
          </div>

          <div className="comment-count">💬 1 Comment so far</div>
        </div>
      ))}

      {/* Create Forum Button (New Button Added) */}
      <button className="create-forum-btn" onClick={handlecreateForum}>
        Create Forum</button>
    </div>
  );
};

export default Forums;
