interface FollowContextType {
  following: Record<string, boolean>; // Lưu trạng thái follow cho mỗi người dùng
  setFollowing: (username: string, following: boolean) => void;
}
