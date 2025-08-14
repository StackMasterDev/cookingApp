import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/models/Recipe';


// likes the recipes
export async function POST(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const { userID } = await request.json();

    const recipe = await Recipe.findById(id);

    const existingLike = recipe.likes.find(
      like => like.user.toString() === userID
    );

    if (existingLike) {
      recipe.likes = recipe.likes.filter(
        like => like.user.toString() !== userID
      );
      await recipe.save();

      return NextResponse.json({
        message: 'Like removed',
        liked: false,
        likeCount: recipe.likes.length
      });
    } else {
      recipe.likes.push({ user: userID });
      await recipe.save();

      return NextResponse.json({
        message: 'Like added',
        liked: true,
        likeCount: recipe.likes.length
      });
    }

  } catch (error) {
    console.error('Like process error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
