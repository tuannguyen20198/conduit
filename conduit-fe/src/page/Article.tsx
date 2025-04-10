import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosConfig';
import ReactMarkdown from 'react-markdown';
import { useFollow } from '@/context/FollowContext';
import rehypeRaw from 'rehype-raw';
import Comment from '@/component/Comment';
import useArticles from '@/hook/useArticles';



const Article = () => {
  const { user } = useAuth();
  const {loading,error,article,handleDelete,handleFavorite,handleFollowToggle,isFollowing} =useArticles()
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!article) return <div>Article not found.</div>;

  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>
          <div className="article-meta">
            <Link to={`/profile/${article.author?.username}`}>
              <img src={article.author?.image || 'http://i.imgur.com/Qr71crq.jpg'} alt="author" />
            </Link>
            <div className="info">
              <Link to={`/profile/${article.author?.username}`} className="author">
                {article.author?.username}
              </Link>
              <span className="date">{article.createdAt}</span>
            </div>

            {user && user?.username !== article.author?.username && (
              <button className="btn btn-sm btn-outline-secondary" onClick={() => handleFollowToggle(article.author?.username)}>
                <i className={isFollowing ? 'ion-minus-round' : 'ion-plus-round'} />
                &nbsp; {isFollowing ? `Unfollow ${article.author?.username}` : `Follow ${article.author?.username}`}
              </button>
            )}

            <button className="btn btn-sm btn-outline-primary" onClick={handleFavorite}>
              <i className="ion-heart" />
              &nbsp; Favorite Article <span className="counter">({article.favoritesCount})</span>
            </button>

            {user && user?.username === article.author?.username && (
              <>
                <button className="btn btn-sm btn-outline-secondary">
                  <Link to={`/editor/${article.slug}`}><i className="ion-edit"></i> Edit Article</Link>
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={handleDelete}>
                  <i className="ion-trash-a" /> Delete Article
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{article.body}</ReactMarkdown>
            <ul className="tag-list">
              {article.tagList?.map((tag) => (
                <li className="tag-default tag-pill tag-outline" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <hr />
      </div>
      <Comment />
    </div>
  );
};

export default Article;
