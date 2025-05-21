import Post from "../post/Post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Posts = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["posts"], // ✅ Corrected syntax
    queryFn: async () => {
      const res = await makeRequest.get("/posts");
      return res.data;
    },
  });

  console.log(data);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="posts">
      {data?.map((post) => (
        <Post post={post} key={post.id} />
      ))}
    </div>
  );
};

export default Posts;
