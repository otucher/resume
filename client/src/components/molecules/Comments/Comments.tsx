import React, { useState, useEffect } from "react";
import { Comment } from "../../../models";
import axiosInstance from "../../../axiosInstance";
import NewComment from "../../atoms/NewComment/NewComment";
import CommentComponent from "../../atoms/Comment/Comment";
import "./style.css";

interface CommentsProps {
  postId: number;
}

interface OptimisticComment extends Comment {
  isOptimistic?: boolean;
}

const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const [currentComments, setCurrentComments] = useState<Comment[]>([]);
  const [optimisticComments, setOptimisticComments] = useState<OptimisticComment[]>(currentComments);

  useEffect(() => {
    axiosInstance.get(`/posts/${postId}/comments`)
      .then((response) => setCurrentComments(response.data));
  }, [postId]);

  // replace optimistic comments with real comments after server responds
  useEffect(() => setOptimisticComments(currentComments), [currentComments]);

  const handleNewCommentContent = (commentContent: string) => {
    var newComment = {
      user: "TestUser",
      content: commentContent,
      post_id: postId,
    };
    setOptimisticComments([...currentComments, { id: -1, isOptimistic: true, ...newComment }]); // temp fake id
    axiosInstance
      .post("/comments", newComment)
      .then((response) => setCurrentComments([...currentComments, response.data]));
  };

  const handleDeleteComment = (deletedComment: Comment) => {
    var newComments = currentComments.filter((com) => com !== deletedComment)
    console.log(currentComments, newComments)
    setOptimisticComments([...newComments, { isOptimistic: true, ...deletedComment }]); // temp fake id
    axiosInstance.delete(`/comments/${deletedComment.id}`)
      .then(() => setCurrentComments(newComments))
  }

  return (
    <div>
      <NewComment onSubmitCommentContent={handleNewCommentContent} />
      <div className="comments">
        <h3>Comments</h3>
        <ul>
          {optimisticComments.map((optimisticComment, idx) => (
            <li key={idx}>
              <div className="optimistic-comment" style={{ opacity: optimisticComment.isOptimistic ? 0.5 : undefined }}>
                <CommentComponent
                  comment={optimisticComment}
                  handleDeleteComment={handleDeleteComment}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Comments;
