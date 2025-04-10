// Định nghĩa loại Comment
interface Comment {
  id: string;
  body: string;
  author: {
    username: string;
    image?: string;
  };
  createdAt: string;
}
