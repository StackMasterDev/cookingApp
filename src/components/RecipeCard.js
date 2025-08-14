'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './RecipeCard.module.css';
import { CldImage } from 'next-cloudinary';
import { usePathname } from 'next/navigation';

export default function RecipeCard({ recipe, onDelete }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(recipe.likes?.length || 0);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
    if (storedUser.id && recipe.likes.some(like => like.user === storedUser.id)) {
      setIsLiked(true);
    }
  }, [recipe.likes]);

  const handleLike = async () => {
    if (!user?.id) {
      alert('You must be logged in to like this recipe.');
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipe._id}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const response = await fetch(`/api/recipes/${recipe._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Recipe deleted successfully.');
        if (onDelete) onDelete(recipe._id);
      } else {
        alert('Failed to delete recipe.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Server error while deleting recipe.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {recipe.recipeImages && recipe.recipeImages.length > 0 ? (
          <CldImage
            className={styles.image}
            src={recipe.recipeImages[0]}
            width="500"
            height="500"
            alt="recipe image"
            crop={{ type: 'auto', source: true }}
          />
        ) : (
          <div className={styles.placeholderImage}><span>🍳</span></div>
        )}

        {recipe.mood && (
          <div className={styles.emotionBadge}>
            {recipe.mood.icon} {recipe.mood.emotionName}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{recipe.name}</h3>

        <div className={styles.author}>
          <span>👤 {recipe.userID?.name || 'Anonymous'}</span>
          <span>📅 {formatDate(recipe.createdAt)}</span>
        </div>

        {recipe.categories?.length > 0 && (
          <div className={styles.categories}>
            {recipe.categories.map((category, i) => (
              <span key={i} className={styles.category}>
                {category.categoryName}
              </span>
            ))}
          </div>
        )}

        {recipe.emotionNote && (
          <p className={styles.emotionNote}>{recipe.emotionNote}</p>
        )}

        <div className={styles.stats}>
          <div className={styles.stat}><span>❤️ {likeCount}</span></div>
          <div className={styles.stat}><span>💬 {recipe.comments?.length || 0}</span></div>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
          >
            {isLiked ? '❤️' : '🤍'} Like
          </button>
          <Link href={`/recipe/${recipe._id}`} className={styles.viewButton}>
            👁️ View
          </Link>


          {user?.id && pathname === '/profile' && (
            <button
              onClick={handleDelete}
              className={styles.deleteButton}
              style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px' }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
