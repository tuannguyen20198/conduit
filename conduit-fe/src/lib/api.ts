import api from "./axiosConfig";

const handleAPIError = (error: any) => {
  if (error.response) {
    throw new Error(
      error.response.data.errors
        ? JSON.stringify(error.response.data.errors)
        : "API Error"
    );
  } else {
    throw new Error(error.message);
  }
};

// ✅ Đăng ký (Register)
export const registerUser = async (user: {
  username: string;
  email: string;
  password: string;
}) => {
  try {
    const { data } = await api.post("/users", { user });
    return data;
  } catch (error) {
    handleAPIError(error);
  }
};

// ✅ Đăng nhập (Login)
export const loginUser = async (user: { email: string; password: string }) => {
  try {
    const { data } = await api.post("/users/login", { user });
    return data;
  } catch (error) {
    handleAPIError(error);
  }
};

// ✅ Lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
  try {
    const { data } = await api.get("/user");
    return data;
  } catch (error) {
    handleAPIError(error);
  }
};

// ✅ Cập nhật thông tin người dùng
export const updateUser = async (
  userData: Partial<{
    email: string;
    username: string;
    bio: string;
    image: string;
  }>
) => {
  try {
    const { data } = await api.put("/user", { user: userData });

    if (!data?.user) throw new Error("Invalid API response"); // Kiểm tra API có trả về user không

    return data;
  } catch (error) {
    handleAPIError(error);
    throw error; // Thêm throw để đảm bảo lỗi bị bắt
  }
};

// ✅ Lấy danh sách bài viết
export const getArticlesGeneral = async (params: any) => {
  const { author, tag, offset, limit, favorites } = params;

  const url = "/articles"; // Endpoint cho các bài viết thông thường

  // Xây dựng query string
  const queryParams = new URLSearchParams();

  if (author) queryParams.append("author", author); // Thêm author vào query string nếu có
  if (tag) queryParams.append("tag", tag); // Thêm tag vào query string nếu có
  if (offset !== undefined) queryParams.append("offset", String(offset)); // Thêm offset vào query string nếu có
  if (limit !== undefined) queryParams.append("limit", String(limit)); // Thêm limit vào query string nếu có
  if (favorites) queryParams.append("favorites", favorites); // Thêm favorites vào query string nếu có

  const finalUrl = `${url}?${queryParams.toString()}`;

  console.log("Calling URL for General Articles:", finalUrl); // Log URL để kiểm tra

  try {
    const response = await api.get(finalUrl); // Gọi API với URL đã xây dựng
    return response.data;
  } catch (error) {
    console.error("Error fetching general articles:", error);
    throw error;
  }
};
export const getArticlesFeed = async (params: any) => {
  const { author, tag, offset, limit, favorites } = params;

  const url = "/articles/feed"; // Endpoint cho feed của người dùng

  // Xây dựng query string
  const queryParams = new URLSearchParams();

  if (author) queryParams.append("author", author); // Thêm author vào query string nếu có
  if (tag) queryParams.append("tag", tag); // Thêm tag vào query string nếu có
  if (offset !== undefined) queryParams.append("offset", String(offset)); // Thêm offset vào query string nếu có
  if (limit !== undefined) queryParams.append("limit", String(limit)); // Thêm limit vào query string nếu có
  if (favorites) queryParams.append("favorites", favorites); // Thêm favorites vào query string nếu có

  const finalUrl = `${url}?${queryParams.toString()}`;

  console.log("Calling URL for Feed:", finalUrl); // Log URL để kiểm tra

  try {
    const response = await api.post(finalUrl); // Gọi API với URL đã xây dựng
    return response.data;
  } catch (error) {
    console.error("Error fetching articles from feed:", error);
    throw error;
  }
};
// ✅ Lấy thông tin bài viết theo slug
export const getArticle = async (slug: string) => {
  try {
    const { data } = await api.get(`/articles/${slug}`);
    return data;
  } catch (error) {
    handleAPIError(error);
  }
};

// ✅ Các API khác (theo dõi user, thêm bài viết, xóa bài viết, v.v.) vẫn giữ nguyên...
export const getTags = async () => {
  try {
    const { data } = await api.get("/tags");
    return data;
  } catch (error) {
    handleAPIError(error);
  }
};

export const getArticleBySlug = async (slug: string) => {
  try {
    const response = await api.post(`/articles/${slug}`);
    return response.data.article.article;
  } catch (error) {
    console.error("Error fetching article:", error);
  }
};

export const createArticle = async (data: any) => {
  console.log("Payload gửi lên API:", data);

  try {
    const response = await api.post("/articles", {
      article: {
        title: data.title,
        description: data.description,
        body: data.body,
        tagList: data.tags || [],
      },
    });

    console.log("Response từ server:", response.data);

    if (response.status === 200) {
      alert("Article published successfully!");
    }
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
};

export const followUser = async (username: string) => {
  const response = await api.post(`/profiles/${username}/follow`);
  return response.data;
};

export const unfollowUser = async (username: string) => {
  const response = await api.delete(`/profiles/${username}/follow`);
  return response.data;
};

export const favoriteArticle = async (slug: string) => {
  const response = await api.post(`/articles/${slug}/favorite`);
  return response.data;
};

export const unfavoriteArticle = async (slug: string) => {
  const response = await api.delete(`/articles/${slug}/favorite`);
  return response.data;
};
export const getMe = async () => {
  try {
    const { data } = await api.get("/user");
    return data.user; // API trả về { user: { id, email, username, ... } }
  } catch (error) {
    throw error;
  }
};

export const getProfile = async (username: string) => {
  try {
    const { data } = await api.get(`/profiles/${username}`); // API trả về { profile: { id, email, username, ... } }
    return data.profile;
  } catch (error) {
    throw error;
  }
};

export const updateArticle = async (slug: string, article: any) => {
  try {
    // Gửi API yêu cầu cập nhật bài viết với cấu trúc đúng `{ article: { ... } }`
    const { data } = await api.put(`/articles/${slug}`, { article }); // Truyền { article: article }

    return data; // Trả về dữ liệu bài viết sau khi được cập nhật
  } catch (error) {
    throw error; // Nếu có lỗi, throw lỗi để xử lý
  }
};

export const deleteArticle = async (slug: string) => {
  try {
    const { data } = await api.delete(`/articles/${slug}`); // Gửi API yêu cầu xóa bài viết
    return data; // Trả về dữ liệu bài viết sau khi được xóa
  } catch (error) {
    throw error;
  }
};
