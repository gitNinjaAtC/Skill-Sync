import { format, isToday, isYesterday } from "date-fns";

export const groupMessagesByDate = (messages) => {
  const groups = {};

  messages.forEach((msg) => {
    const date = new Date(msg.createdAt);

    let key = format(date, "yyyy-MM-dd");
    if (isToday(date)) key = "Today";
    else if (isYesterday(date)) key = "Yesterday";
    else key = format(date, "dd MMM yyyy");

    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
  });

  return groups;
};
