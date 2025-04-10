import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axiosConfig";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";



const Comment = () => {
    const { slug } = useParams();
    const [commentText, setCommentText] = useState(''); // State cho input comment
    const [comments, setComments] = useState<Comment[]>([]); // State lưu trữ comment
    const {user} = useAuth(); // Thông tin người dùng mock

    // Lấy danh sách comment khi component render lần đầu
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await api.get(`/articles/${slug}/comments`);
                setComments(response.data.comments); // Lưu lại comment trong state
            } catch (error) {
                alert('Error loading comments');
            }
        };

        fetchComments();
    }, [slug]); // Khi slug thay đổi, gọi lại API để lấy comment mới

    // Đăng bài comment mới
    const handlePostComment = async () => {
        if (!commentText.trim()) return; // Không đăng khi comment trống

        try {
            const response = await api.post(`/articles/${slug}/comments`, {
                comment: { body: commentText },
            });
            setComments([response.data.comment, ...comments]); // Thêm comment mới vào đầu danh sách
            setCommentText(''); // Xóa input sau khi gửi
        } catch (error) {
            alert('Error posting comment');
        }
    };

    // Xóa comment
    const handleDeleteComment = async (commentId: string) => {
        try {
            if (window.confirm('Are you sure you want to delete this comment?')) {
                await api.delete(`/articles/${slug}/comments/${commentId}`);
                setComments(comments.filter((comment) => comment.id !== commentId)); // Loại bỏ comment bị xóa khỏi danh sách
                alert('Comment deleted');
            }
        } catch (err) {
            console.log(err);
            alert('Error deleting comment');
        }
    };

    return (
        <div className="row">
            <div className="col-xs-12 col-md-8 offset-md-2">
                {/* Form để đăng comment */}
                <form
                    className="card comment-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handlePostComment();
                    }}
                >
                    <div className="card-block">
                        <textarea
                            className="form-control"
                            placeholder="Write a comment..."
                            rows={3}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                    </div>
                    <div className="card-footer">
                        <img src={user?.image || 'http://i.imgur.com/Qr71crq.jpg'} className="comment-author-img" alt="user" />
                        <button className="btn btn-sm btn-primary">Post Comment</button>
                    </div>
                </form>

                {/* Hiển thị danh sách comment */}
                {comments.map((comment) => (
                    <div className="card" key={comment.id}>
                        <div className="card-block">
                            <p className="card-text">{comment.body}</p>
                        </div>
                        <div className="card-footer">
                            <a
                                href={`/profile/${comment.author.username}`}
                                className="comment-author"
                            >
                                <img
                                    src={comment.author.image || 'http://i.imgur.com/Qr71crq.jpg'}
                                    className="comment-author-img"
                                    alt="author"
                                />
                            </a>
                            &nbsp;
                            <a href={`/profile/${comment.author.username}`} className="comment-author">
                                {comment.author.username}
                            </a>
                            <span className="date-posted">{comment.createdAt}</span>

                            {/* Kiểm tra nếu người dùng là tác giả của comment mới cho phép xóa */}
                            {user?.username === comment.author.username && (
                                <span
                                    className="mod-options justify-center align-middle"
                                    style={{
                                        cursor: 'pointer',
                                        color: 'red', // Bạn có thể thay đổi màu sắc nếu cần
                                        fontSize: '24px', // Đảm bảo icon có kích thước đủ lớn
                                    }}
                                    onClick={() => handleDeleteComment(comment.id)}
                                >
                                    <i className="ion-trash-a"></i> {/* Biểu tượng xóa */}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comment;
