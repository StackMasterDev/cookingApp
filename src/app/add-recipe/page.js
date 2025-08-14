'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import categories from '@/data/categories.json';
import emotions from '@/data/emotions.json';

export default function AddRecipe() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    categories: [],
    ingredientList: [''],
    recipeDescription: '',
    moodNote: '',
    emotion: null
  });

  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (e) {
      console.error('JSON parse error:', e);
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoryChange = (category) => {
    const isSelected = formData.categories.find(c => c.id === category.id);
    if (isSelected) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(c => c.id !== category.id)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category]
      });
    }
  };

  const handleEmotionChange = (emotion) => {
    setFormData({
      ...formData,
      emotion: emotion
    });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredientList];
    newIngredients[index] = value;
    setFormData({
      ...formData,
      ingredientList: newIngredients
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredientList: [...formData.ingredientList, '']
    });
  };

  const removeIngredient = (index) => {
    if (formData.ingredientList.length > 1) {
      const newIngredients = formData.ingredientList.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        ingredientList: newIngredients
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024;
    const maxFiles = 5;

    if (files.length > maxFiles) {
      setError(`You can select a maximum of ${maxFiles} images.`);
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        invalidFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`The following images are too large (max 5MB): ${invalidFiles.join(', ')}`);
      return;
    }

    setSelectedImages(validFiles);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.name || formData.ingredientList.length === 0 || !formData.recipeDescription) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (formData.ingredientList.some(ingredient => !ingredient.trim())) {
      setError('Please fill in all ingredient fields.');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (user && user.id) {
        formDataToSend.append('userID', user.id);
      } else {
        setError('User information not found.');
        setLoading(false);
        return;
      }

      formDataToSend.append('categories', JSON.stringify(formData.categories));
      formDataToSend.append('ingredientList', JSON.stringify(formData.ingredientList));
      formDataToSend.append('recipeDescription', formData.recipeDescription);
      formDataToSend.append('moodNote', formData.moodNote);
      formDataToSend.append('emotion', JSON.stringify(formData.emotion));

      selectedImages.forEach((image) => {
        formDataToSend.append('recipeImages', image);
      });

      const response = await fetch('/api/recipes', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Recipe added successfully!');
        setFormData({
          name: '',
          categories: [],
          ingredientList: [''],
          recipeDescription: '',
          emotionNote: '',
          emotion: null
        });
        setSelectedImages([]);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.error || 'An error occurred while adding the recipe.');
      }
    } catch (error) {
      console.error('API call error:', error);
      setError('Server error.');
    } finally {
      setLoading(false);
    }
  };
  if (!user) {
    return <div>Loading...</div>;
  }
  console.log(user)
  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Add New Recipe</h1>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.success}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Recipe Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                required
                placeholder="Enter the name of your recipe"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Categories</label>
              <div className={styles.categoryGrid}>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`${styles.categoryButton} ${formData.categories.find(c => c.id === category.id) ? styles.selected : ''
                      }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category.categoryName}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Ingredients *</label>
              {formData.ingredientList.map((ingredient, index) => (
                <div key={index} className={styles.ingredientRow}>
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    className={styles.input}
                    placeholder="Ingredient name"
                    required
                  />
                  {formData.ingredientList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className={styles.removeButton}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className={styles.addButton}
              >
                + Add Ingredient
              </button>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="recipeDescription" className={styles.label}>
                Recipe Description *
              </label>
              <textarea
                id="recipeDescription"
                name="recipeDescription"
                value={formData.recipeDescription}
                onChange={handleChange}
                className={styles.textarea}
                required
                placeholder="Describe your recipe in detail..."
                rows={6}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="moodNote" className={styles.label}>
                Mood Note
              </label>
              <textarea
                id="moodNote"
                name="moodNote"
                value={formData.moodNote}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Share how you felt while making this recipe..."
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Emotion</label>
              <div className={styles.emotionGrid}>
                {emotions.map((emotion) => (
                  <button
                    key={emotion.id}
                    type="button"
                    className={`${styles.emotionButton} ${formData.emotion?.id === emotion.id ? styles.selected : ''
                      }`}
                    onClick={() => handleEmotionChange(emotion)}
                  >
                    {emotion.icon} {emotion.emotionName}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="images" className={styles.label}>
                Recipe Images
              </label>
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
              {selectedImages.length > 0 && (
                <div className={styles.imagePreview}>
                  <p>Selected images: {selectedImages.length}</p>
                  <div className={styles.imageGrid}>
                    {selectedImages.map((image, index) => (
                      <div key={index} className={styles.imageItem}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className={styles.previewImage}
                        />
                        <span className={styles.imageName}>{image.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Adding Recipe...' : 'Add Recipe'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );

}