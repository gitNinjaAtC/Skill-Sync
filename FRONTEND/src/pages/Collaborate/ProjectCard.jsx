import React from "react";

const statusLabel = { open: "Open", "in-progress": "In Progress", completed: "Completed" };

const Avatar = ({ user, size = 26 }) =>
  user?.profilePic ? (
    <img src={user.profilePic} alt={user.name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
  ) : (
    <div className="avatar-fallback" style={{ width: size, height: size }}>
      {user?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );

const ProjectCard = ({ project, onClick, myApplicationStatus }) => {
  const { title, status, postedBy, description, techStack, slots, slotsRemaining, deadline } = project;
  const deadlineStr = new Date(deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="project-card" onClick={onClick}>
      <div className="project-card__header">
        <h3 className="project-card__title">{title}</h3>
        <span className={`project-card__status project-card__status--${status}`}>
          {statusLabel[status]}
        </span>
      </div>

      <div className="project-card__poster">
        <Avatar user={postedBy} />
        <span>{postedBy?.name} · {postedBy?.role}</span>
      </div>

      <p className="project-card__description">{description}</p>

      {techStack?.length > 0 && (
        <div className="project-card__tech">
          {techStack.map((t) => <span key={t}>{t}</span>)}
        </div>
      )}

      <div className="project-card__meta">
        <span>👥 {slotsRemaining} / {slots} slots left</span>
        <span>📅 {deadlineStr}</span>
      </div>

      {myApplicationStatus && (
        <div className="project-card__actions">
          <span className={`applicant-card__status applicant-card__status--${myApplicationStatus}`}>
            Your application: {myApplicationStatus}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;