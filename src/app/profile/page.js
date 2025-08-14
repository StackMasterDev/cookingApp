'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RecipeCard from '@/components/RecipeCard';
import { CldImage } from 'next-cloudinary';

export default function Profile() {
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const userObj = JSON.parse(userData);
    setUser(userObj);
    setFormData({
      name: userObj.name,
      email: userObj.mail
    });
    const userId = userObj.id || userObj._id;
    fetchUserProfile(userId);
    fetchUserRecipes(userId);
  }, [router]);

  const fetchUserProfile = async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/users/profile?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setUserProfile(data.user);
        console.log(data.user);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const fetchUserRecipes = async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/recipes?page=${page}&limit=6`);
      const data = await response.json();
      if (response.ok) {
        setRecipes(data.recipes);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Recipe fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserRecipes(user.id);
    }
  }, [user, page]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Profile image is too large (maximum 5MB)');
        return;
      }
      setSelectedImage(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setError('');
    setSuccess('');
    try {
      const userId = user.id || user._id;
      if (!userId) {
        setError('User information not found');
        return;
      }
      const formDataToSend = new FormData();
      formDataToSend.append('userId', userId);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      if (selectedImage) {
        formDataToSend.append('profileImage', selectedImage);
      }
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        body: formDataToSend,
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setUserProfile(data.user);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsEditing(false);
        setSelectedImage(null);
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.error || 'An error occurred while updating the profile');
      }
    } catch (error) {
      setError('Server error');
    } finally {
      setProfileLoading(false);
    }
  };
  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This will permanently remove all your recipes as well.'
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      const userId = user.id || user._id;
      const response = await fetch(`/api/users/profile?userId=${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (response.ok) {
        alert('Your account and recipes have been deleted successfully.');
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        alert(data.error || 'An error occurred while deleting your account.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Server error while deleting account.');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <div className={styles.profileImageContainer}>
              {userProfile?.profileImage ? (
                <CldImage
                  className={styles.profileImage}
                  src={userProfile.profileImage}
                  width="500"
                  height="500"
                  alt='profile image'
                  crop={{
                    type: 'auto',
                    source: true
                  }}
                />
              ) : (
                <div className={styles.profilePlaceholder}>
                  <span>👤</span>
                </div>
              )}
            </div>
            <div className={styles.profileInfo}>
              <h1 className={styles.profileName}>{userProfile?.name || user.name}</h1>
              <p className={styles.profileEmail}>{userProfile?.email || user.email}</p>
              <p className={styles.profileStats}>
                📊 {recipes.length} recipes shared
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={styles.editButton}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button
              onClick={handleDeleteAccount}
              className={styles.deleteButton}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
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
          {isEditing && (
            <div className={styles.editForm}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="profileImage" className={styles.label}>
                    Profile Image
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                  />
                  {selectedImage && (
                    <div className={styles.imagePreview}>
                      <p>Selected image: {selectedImage.name}</p>
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Profile image preview"
                        className={styles.previewImage}
                      />
                    </div>
                  )}
                </div>
                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={profileLoading}
                  >
                    {profileLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        <div className={styles.recipesSection}>
          <h2 className={styles.sectionTitle}>My Recipes</h2>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className={styles.empty}>
              <p>You haven't shared any recipes yet.</p>
              <Link href="/add-recipe" className={styles.addRecipeButton}>
                Share Your First Recipe
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.recipeGrid}>
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onDelete={(id) => setRecipes((prev) => prev.filter(r => r._id !== id))}
                  />
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
        </div>
      </main>
      <Footer />
    </div>
  );
}