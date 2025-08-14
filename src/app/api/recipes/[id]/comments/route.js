import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/models/Recipe';



// add comment to recipe
export async function POST(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const { userID, content } = await request.json();

    if (!userID || !content) {
      return NextResponse.json(
        { error: 'User ID and comment content are required' },
        { status: 400 }
      );
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    const newComment = {
      user: userID,
      content: content
    };

    recipe.comments.push(newComment);
    await recipe.save();

    const populatedRecipe = await Recipe.findById(id)
      .populate('comments.user', 'name')
      .populate('comments.replies.user', 'name');

    return NextResponse.json(
      { message: 'Comment successfully added', recipe: populatedRecipe },
      { status: 201 }
    );

  } catch (error) {
    console.error('Comment adding error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
