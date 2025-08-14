'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CldImage } from 'next-cloudinary';

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [user, setUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchRecipe();
  }, [id]);

  useEffect(() => {
    if (user && recipe) {
      setIsLiked(recipe.likes.some(like => like.user.toString() === user.id));
    }
  }, [recipe, user]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recipes/${id}`);
      const data = await response.json();

      if (response.ok) {
        setRecipe(data.recipe);
      } else {
        setError(data.error || 'Recipe not found');
      }
    } catch (error) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to comment.');
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: user.id,
          content: commentText
        }),
      });

      if (response.ok) {
        setCommentText('');
        fetchRecipe();
      }
    } catch (error) {
      console.error('Comment adding error:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('You must be logged in to like.');
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${id}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        fetchRecipe();
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading recipe...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <p>{error || 'Recipe not found'}</p>
            <Link href="/" className={styles.backButton}>
              Go to Home Page
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.recipeContainer}>
          <div className={styles.recipeHeader}>
            <h1 className={styles.recipeTitle}>{recipe.name}</h1>
            <div className={styles.recipeMeta}>
              <Link href={`/profile/${recipe.userID._id}`} className={styles.authorLink}>
                <span>👤 {recipe.userID.name}</span>
              </Link>
              <span>📅 {formatDate(recipe.createdAt)}</span>
            </div>
          </div>

          {recipe.recipeImages && recipe.recipeImages.length > 0 && (
            <div className={styles.imageGallery}>
              {recipe.recipeImages.map((image, index) => (
                <div key={index} className={styles.imageContainer}>
                  <CldImage
                    className={styles.recipeImage}
                    src={image}
                    width="500"
                    height="500"
                    alt='recipe image'
                    crop={{
                      type: 'auto',
                      source: true
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {recipe.moodNote && (
            <div className={styles.emotionNote}>
              <p>{recipe.moodNote}</p>
            </div>
          )}

          {recipe.emotion && (
            <div className={styles.emotionBadge}>
              {recipe.emotion.icon} {recipe.emotion.emotionName}
            </div>
          )}

          {recipe.categories && recipe.categories.length > 0 && (
            <div className={styles.categories}>
              <h3>Categories</h3>
              <div className={styles.categoryList}>
                {recipe.categories.map((category, index) => (
                  <span key={index} className={styles.category}>
                    {category.categoryName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.ingredients}>
            <h3>Ingredients</h3>
            <ul className={styles.ingredientList}>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className={styles.ingredientItem}>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.recipeDescription}>
            <h3>Recipe Description</h3>
            <div className={styles.descriptionContent}>
              {recipe.recipeDescription.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              onClick={handleLike}
              className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
            >
              {isLiked ? '❤️ Unlike' : '🤍 Like'} ({recipe.likes?.length || 0})
            </button>
          </div>

          <div className={styles.comments}>
            <h3>Comments ({recipe.comments?.length || 0})</h3>

            {user && (
              <form onSubmit={handleComment} className={styles.commentForm}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write your comment..."
                  className={styles.commentInput}
                  rows={3}
                />
                <button type="submit" className={styles.commentButton}>
                  Comment
                </button>
              </form>
            )}

            <div className={styles.commentList}>
              {recipe.comments && recipe.comments.length > 0 ? (
                recipe.comments.map((comment, index) => (
                  <div key={index} className={styles.comment}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>
                        {comment.user?.name || 'Anonymous'}
                      </span>
                      <span className={styles.commentDate}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className={styles.commentContent}>{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className={styles.noComments}>No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}