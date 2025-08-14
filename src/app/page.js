'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import RecipeCard from '@/components/RecipeCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import categories from '@/data/categories.json';
import emotions from '@/data/emotions.json';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, [page, selectedCategory, selectedEmotion, searchTerm]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      let url = `/api/recipes?page=${page}&limit=12`;

      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }

      if (selectedEmotion) {
        url += `&emotion=${selectedEmotion}`;
      }

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setRecipes(data.recipes);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error while fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleEmotionChange = (emotion) => {
    setSelectedEmotion(emotion);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedEmotion('');
    setSearchTerm('');
    setPage(1);
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Delicious Recipes, Beautiful Memories</h1>
          <p className={styles.heroSubtitle}>Unleash your creativity in the kitchen and share your memories</p>

        </section>

        <section className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            <button onClick={clearFilters} className={styles.clearButton}>
              Clear Filters
            </button>
          </div>
        </section>

        <section className={styles.filters}>
          <div className={styles.filterGroup}>
            <h3>Categories</h3>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${selectedCategory === '' ? styles.active : ''}`}
                onClick={() => handleCategoryChange('')}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`${styles.filterButton} ${selectedCategory === category.categoryName ? styles.active : ''}`}
                  onClick={() => handleCategoryChange(category.categoryName)}
                >
                  {category.categoryName}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h3>Emotions</h3>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${selectedEmotion === '' ? styles.active : ''}`}
                onClick={() => handleEmotionChange('')}
              >
                All
              </button>
              {emotions.map((emotion) => (
                <button
                  key={emotion.id}
                  className={`${styles.filterButton} ${selectedEmotion === emotion.emotionName ? styles.active : ''}`}
                  onClick={() => handleEmotionChange(emotion.emotionName)}
                >
                  {emotion.icon} {emotion.emotionName}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.recipes}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className={styles.empty}>
              <p>No recipes found yet.</p>
            </div>
          ) : (
            <>
              <div className={styles.recipeGrid}>
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.paginationButton}
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span className={styles.pageInfo}>
                    Page {page} / {totalPages}
                  </span>
                  <button
                    className={styles.paginationButton}
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}