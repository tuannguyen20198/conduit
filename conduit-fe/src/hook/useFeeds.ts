import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { useTags } from "./useTags";
import {
  favoriteArticle,
  followUser,
  getArticlesFeed,
  getArticlesGeneral,
  unfavoriteArticle,
  unfollowUser,
} from "@/lib/api";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axiosConfig";

const useFeeds = () => {
  const [activeTab, setActiveTab] = useState<
    | "your"
    | "global"
    | "tag"
    | "favorited"
    | "myArticles"
    | "favoritedArticles"
    | "feed"
  >("global");
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Lưu trữ nhiều tags
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<ArticleFormData[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const articlesPerPage = 10;
  const { user: authToken } = useAuth();
  const { data: tags } = useTags();
  const pageCount = Math.max(1, Math.ceil(totalArticles / articlesPerPage));
  const navigate = useNavigate();
  const simulateDelay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Cập nhật khi URL hash thay đổi
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // bỏ dấu #
      const tagsFromHash = hash ? hash.split(",") : [];

      setSelectedTags(tagsFromHash);

      if (tagsFromHash.length > 0) {
        setActiveTab("tag");
      } else {
        setActiveTab("global");
      }
    };

    handleHashChange(); // chạy lần đầu
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Fetch articles
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const startTime = Date.now();
      await simulateDelay(100);
      let url = "/articles";
      let params: any = {
        offset: (currentPage - 1) * articlesPerPage,
        limit: articlesPerPage,
      };

      if (activeTab === "your" && authToken) {
        url = "/articles/feed";
      } else if (activeTab === "global") {
        url = "/articles";
      } else if (activeTab === "tag") {
        if (selectedTags.length > 0) {
          params = { ...params, tag: selectedTags.join(",") };
        } else {
          // ✅ Fallback về Global nếu không còn tag
          setActiveTab("global");
          return; // thoát luôn, tránh gọi API lỗi
        }
      }

      const response = await api.get(url, { params });
      setArticles(response.data.articles);
      setTotalArticles(response.data.articlesCount);
    } catch (err) {
      setError("Failed to load articles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(); // Fetch articles khi thay đổi tab, tags hoặc page
  }, [activeTab, selectedTags, currentPage]);

  const handlePageClick = ({ selected }: { selected: number }) => {
    setCurrentPage(selected + 1);
  };

  const handleLike = async (
    slug: string,
    favorited: boolean,
    favoritesCount: number
  ) => {
    if (!user) {
      alert("Bạn cần đăng nhập để like bài viết!");
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
      return;
    }

    const validFavoritesCount = isNaN(favoritesCount) ? 0 : favoritesCount;
    const storedLikes = JSON.parse(
      localStorage.getItem("likedArticles") || "{}"
    );
    const currentLikes = storedLikes[slug] || [];

    const updatedFavorited = !currentLikes.includes(user.username);
    const updatedFavoritesCount = updatedFavorited
      ? validFavoritesCount + 1
      : validFavoritesCount - 1;
    const updatedLikedBy = updatedFavorited
      ? [...currentLikes, user.username]
      : currentLikes.filter((username: string) => username !== user.username);

    storedLikes[slug] = updatedLikedBy;
    localStorage.setItem("likedArticles", JSON.stringify(storedLikes));

    setArticles((prev) =>
      prev.map((article) =>
        article.slug === slug
          ? {
              ...article,
              favorited: updatedFavorited,
              favoritesCount: updatedFavoritesCount,
              likedBy: updatedLikedBy,
            }
          : article
      )
    );

    try {
      if (updatedFavorited) {
        await favoriteArticle(slug);
      } else {
        await unfavoriteArticle(slug);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái yêu thích:", err);
      setArticles((prev) =>
        prev.map((article) =>
          article.slug === slug
            ? {
                ...article,
                favorited: favorited,
                favoritesCount: favorited
                  ? validFavoritesCount + 1
                  : validFavoritesCount - 1,
              }
            : article
        )
      );
    }
  };

  const handleFollow = async (username: string, following: boolean) => {
    try {
      const updatedUser = following
        ? await unfollowUser(username)
        : await followUser(username);

      // Lưu trạng thái follow vào localStorage
      const followingData = JSON.parse(
        localStorage.getItem("followingData") || "{}"
      );
      followingData[username] = updatedUser.following;
      localStorage.setItem("followingData", JSON.stringify(followingData));

      // Cập nhật lại bài viết sau khi thực hiện hành động follow/unfollow
      setArticles((prevArticles) => {
        return Array.isArray(prevArticles)
          ? prevArticles.map((article) =>
              article.author.username === username
                ? {
                    ...article,
                    author: {
                      ...article.author,
                      following: updatedUser.following,
                    },
                  }
                : article
            )
          : [];
      });
    } catch (err) {
      console.error("Error updating follow status", err);
    }
  };

  // Khôi phục trạng thái follow từ localStorage khi reload trang
  useEffect(() => {
    const followingData = JSON.parse(
      localStorage.getItem("followingData") || "{}"
    );

    setArticles((prevArticles) => {
      if (Array.isArray(prevArticles)) {
        return prevArticles.map((article) => {
          const isFollowing = followingData[article.author.username];
          return {
            ...article,
            author: {
              ...article.author,
              following:
                isFollowing !== undefined
                  ? isFollowing
                  : article.author.following,
            },
          };
        });
      }
      return prevArticles;
    });
  }, []);

  // Cập nhật khi click tag
  const handleTagClick = (tag: string) => {
    setSelectedTags((prevTags) => {
      const newTags = prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag];

      // Update hash
      const newHash = newTags.join(",");
      window.location.hash = newHash;

      if (newTags.length === 0) {
        setActiveTab("global");
      } else {
        setActiveTab("tag");
      }

      return newTags;
    });
  };

  return {
    activeTab,
    authToken,
    tags,
    setActiveTab,
    selectedTags,
    setSelectedTags,
    currentPage,
    setCurrentPage,
    articles,
    setArticles,
    totalArticles,
    setTotalArticles,
    isLoading,
    setIsLoading,
    error,
    setError,
    pageCount,
    handlePageClick,
    handleLike,
    handleFollow,
    handleTagClick,
  };
};

export default useFeeds;
