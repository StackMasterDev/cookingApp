import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import cloudinary from '@/lib/cloudinary';


/*
function that filters and returns recipes
*/


export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');
    const emotion = searchParams.get('emotion');
    const search = searchParams.get('search');

    let query = {};

    if (category) {
      query['categories.categoryName'] = category;
    }

    if (emotion) {
      query['mood.emotionName'] = emotion;
    }

    // FIX: Add a new query condition for searching across fields.
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { recipeDescription: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const recipes = await Recipe.find(query)
      .populate('userID', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Recipe.countDocuments(query);

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Recipe list error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


/*
adding recipe 
*/

export async function POST(request) {
  console.log("Request received");
  try {
    await dbConnect();
    const formData = await request.formData();

    const name = formData.get('name');
    const categories = JSON.parse(formData.get('categories'));
    const userID = formData.get('userID');
    const ingredients = JSON.parse(formData.get('ingredientList'));
    const recipeDescription = formData.get('recipeDescription');
    const moodNote = formData.get('moodNote');
    const emotion = JSON.parse(formData.get('emotion'));
    const imageFiles = formData.getAll('recipeImages');

    if (imageFiles.length > 3) {
      return NextResponse.json(
        { error: 'You can upload up to 3 images' },
        { status: 400 }
      );
    }

 
    const recipeImages = [];
    for (const file of imageFiles) {
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadedImage = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'recipes' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });

        recipeImages.push(uploadedImage.secure_url);
      }
    }

    if (!name || !userID || !ingredients.length || !recipeDescription) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const recipe = new Recipe({
      name,
      categories,
      userID,
      recipeImages,
      ingredients,
      recipeDescription,
      moodNote,
      mood: emotion
    });

    await recipe.save();

    return NextResponse.json(
      { message: 'Recipe successfully created', recipe },
      { status: 201 }
    );

  } catch (error) {
    console.error('Recipe creation error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}