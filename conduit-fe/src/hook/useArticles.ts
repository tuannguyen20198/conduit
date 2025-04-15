import { useAuth } from "@/context/AuthContext";
import { useFollow } from "@/context/FollowContext";
import api from "@/lib/axiosConfig";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useArticles = () => {
  const { user } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { following, setFollowing } = useFollow();
  const isFollowing = article
    ? following[article.author.username] || false
    : false;

  // Fetch article
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

  useEffect(() => {
    if (slug) fetchArticle();
  }, [slug]);

  // Reset follow state when the article's author changes
  useEffect(() => {
    if (article && article.author.username) {
      setFollowing(
        article.author.username,
        following[article.author.username] || false
      );
    }
  }, [article?.author?.username, setFollowing, following]);

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

  const unfollowMutation = useMutation({
    mutationFn: (username: string) =>
      api.delete(`/profiles/${username}/follow`),
    onSuccess: (_, username) => {
      setFollowing(username, false);
      alert("Unfollowed successfully");
    },
    onError: () => alert("Error while unfollowing user"),
  });

  const followMutation = useMutation({
    mutationFn: (username: string) => api.post(`/profiles/${username}/follow`),
    onSuccess: (_, username) => {
      setFollowing(username, true);
      alert("Followed successfully");
    },
    onError: () => alert("Error while following user"),
  });

  const favoriteMutation = useMutation({
    mutationFn: () => api.post(`/articles/${slug}/favorite`),
    onSuccess: (response) => {
      const favoritesCount = response.data.article.favoritesCount;
      setArticle((prevArticle) =>
        prevArticle ? { ...prevArticle, favoritesCount } : prevArticle
      );
    },
    onError: (err) => console.log(err),
  });

  const unfavoriteMutation = useMutation({
    mutationFn: () => api.delete(`/articles/${slug}/favorite`),
    onSuccess: (response) => {
      const favoritesCount = response.data.article.favoritesCount;
      setArticle((prevArticle) =>
        prevArticle ? { ...prevArticle, favoritesCount } : prevArticle
      );
    },
    onError: (err) => console.log(err),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/articles/${slug}`),
    onSuccess: () => {
      alert("Article deleted");
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      navigate("/");
    },
    onError: () => {
      alert("You can only delete your own article");
    },
  });

  // Handle follow/unfollow toggle
  const handleFollowToggle = async (username: string) => {
    if (isFollowing) {
      unfollowMutation.mutate(username);
    } else {
      followMutation.mutate(username);
    }
  };

  // Handle favorite/unfavorite article
  const handleFavorite = () => {
    if (article?.favorited) {
      unfavoriteMutation.mutate();
    } else {
      favoriteMutation.mutate();
    }
  };

  // Handle delete article
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      if (user && article?.author.username === user.username) {
        deleteMutation.mutate();
      } else {
        alert("You can only delete your own article");
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
    handleUnfollow: unfollowMutation.mutate,
  };
};

export default useArticles;
