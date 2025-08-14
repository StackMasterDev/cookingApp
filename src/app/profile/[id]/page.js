'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RecipeCard from '@/components/RecipeCard';
import styles from './page.module.css';

export default function UserProfile() {
    const { id } = useParams();
    const [userProfile, setUserProfile] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchUserProfile();
        }
    }, [id]);

    const fetchUserProfile = async () => {
        try {

            setLoading(true);

            const response = await fetch(`/api/users/${id}/recipes`);
            const data = await response.json();

            if (response.ok) {
                setUserProfile(data.user);
                setRecipes(data.recipes);
            } else {
                setError(data.error || 'User not found.');
            }
        } catch (error) {
            setError('Server error.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Header />
                <main className={styles.main}>
                    <div className={styles.loading}>
                        <p>Loading user profile...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !userProfile) {
        return (
            <div className={styles.container}>
                <Header />
                <main className={styles.main}>
                    <div className={styles.error}>
                        <p>{error || 'User not found.'}</p>
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
                <div className={styles.profileHeader}>
                    <h1>{userProfile.name}'s Recipes</h1>
                </div>
                <section className={styles.recipes}>
                    {recipes.length > 0 ? (
                        <div className={styles.recipeGrid}>
                            {recipes.map((recipe) => (
                                <RecipeCard key={recipe._id} recipe={recipe} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <p>This user has not shared any recipes yet.</p>
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );


}