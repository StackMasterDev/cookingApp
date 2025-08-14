import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const recipe = await Recipe.findById(id)
      .populate('userID', 'name')
      .populate('comments.user', 'name')
      .populate('comments.replies.user', 'name')
      .populate('likes.user', 'name');

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ recipe });

  } catch (error) {
    console.error('Recipe detail error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const formData = await request.formData();

    const name = formData.get('name');
    const categories = JSON.parse(formData.get('categories'));
    const ingredientList = JSON.parse(formData.get('ingredientList'));
    const recipeDescription = formData.get('recipeDescription');
    const moodNote = formData.get('moodNote');
    const mood = JSON.parse(formData.get('mood'));

    const updateData = {
      name,
      categories,
      ingredientList,
      recipeDescription,
      moodNote,
      mood
    };

    const imageFiles = formData.getAll('recipeImages');
    if (imageFiles.length > 0) {
      const recipeImages = [];
      for (const file of imageFiles) {
        if (file instanceof File) {
          const buffer = Buffer.from(await file.arrayBuffer());
          recipeImages.push(buffer);
        }
      }
      updateData.recipeImages = recipeImages;
    }

    const recipe = await Recipe.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Recipe successfully updated', recipe }
    );

  } catch (error) {
    console.error('Recipe update error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Recipe successfully deleted' }
    );

  } catch (error) {
    console.error('Recipe delete error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
