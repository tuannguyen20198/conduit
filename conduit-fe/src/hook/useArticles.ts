import { useAuth } from "@/context/AuthContext";
import { useFollow } from "@/context/FollowContext";
import api from "@/lib/axiosConfig";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const useArticles = () => {
  const { user } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { following, setFollowing } = useFollow();
  const isFollowing = article
    ? following[article.author.username] || false
    : false;

  // Fetch article when component mounts
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await api.post(`/articles/${slug}`);
        setArticle(response.data.article.article);
        setLoading(false);
      } catch (error) {
        setError("Failed to load article");
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);
  // Reset follow state when the article's author changes
  useEffect(() => {
    if (article && article.author.username) {
      setFollowing(
        article.author.username,
        following[article.author.username] || false
      );
    }
  }, [article?.author?.username, setFollowing, following]); // This will ensure the following state is correctly updated when switching to a new user or article

  // Sync follow status from localStorage on mount
  useEffect(() => {
    const savedFollowData = localStorage.getItem("followingData");
    if (savedFollowData) {
      const parsedFollowData = JSON.parse(savedFollowData);
      if (article) {
        const isUserFollowing =
          parsedFollowData[article.author.username] || false;
        setFollowing(article.author.username, isUserFollowing);
      }
    }
  }, [article?.author?.username, setFollowing]);

  // Sync follow status from localStorage on mount
  useEffect(() => {
    const savedFollowData = localStorage.getItem("followingData");
    if (savedFollowData) {
      const parsedFollowData = JSON.parse(savedFollowData);
      if (article) {
        const isUserFollowing =
          parsedFollowData[article.author.username] || false;
        setFollowing(article.author.username, isUserFollowing);
      }
    }
  }, [article?.author?.username, setFollowing]);

  // Update follow status in localStorage whenever it changes
  useEffect(() => {
    if (article) {
      localStorage.setItem("followingData", JSON.stringify(following));
    }
  }, [following, article]);

  // Handle follow/unfollow toggle
  const handleFollowToggle = async (username: string) => {
    try {
      if (isFollowing) {
        await handleUnfollow(username);
      } else {
        await api.post(`/profiles/${username}/follow`);
        setFollowing(username, true);
        alert("Followed successfully");
      }
    } catch (err) {
      alert("Error while following user");
    }
  };

  const handleUnfollow = async (username: string) => {
    try {
      await api.delete(`/profiles/${username}/follow`);
      setFollowing(username, false);
      alert("Unfollowed successfully");
    } catch (err) {
      alert("Error while unfollowing user");
    }
  };

  // Handle favorite article
  const handleFavorite = async () => {
    try {
      const response = await api.post(`/articles/${slug}/favorite`);
      setArticle((prevArticle: any) =>
        prevArticle
          ? {
              ...prevArticle,
              favoritesCount: response.data.article.favoritesCount,
            }
          : prevArticle
      );
    } catch (err) {
      console.log(err);
    }
  };

  // Handle delete article
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        if (user && article?.author.username === user.username) {
          await api.delete(`/articles/${slug}`);
          alert("Article deleted");
          navigate("/"); // Redirect to homepage after deletion
        } else {
          alert("You can only delete your own article");
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
  return {
    article,
    loading,
    error,
    isFollowing,
    handleFollowToggle,
    handleFavorite,
    handleDelete,
    handleUnfollow,
  };
};

export default useArticles;
