import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import cloudinary from '@/lib/cloudinary';
import Recipe from '@/models/Recipe';

//function that returns our own profile
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// update the profile like updating profile photo or name
export async function PUT(request) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const userId = formData.get('userId');
    const name = formData.get('name');
    const email = formData.get('email');

    if (!userId || userId === 'undefined') {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const updateData = { name, email };

    const profileImage = formData.get('profileImage');

    if (profileImage && typeof profileImage === 'object') {
      const arrayBuffer = await profileImage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const base64Image = buffer.toString('base64');
      const dataUrl = `data:${profileImage.type};base64,${base64Image}`;

      const uploadedImage = await cloudinary.uploader.upload(dataUrl, {
        folder: 'profile_images'
      });

      updateData.profileImage = uploadedImage.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', user });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


// delete the profile
export async function DELETE(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }


    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }


    if (user.profileImage) {
      const publicIdMatch = user.profileImage.match(/\/profile_images\/([^\.]+)/);
      if (publicIdMatch && publicIdMatch[1]) {
        const publicId = `profile_images/${publicIdMatch[1]}`;
        await cloudinary.uploader.destroy(publicId);
      }
    }


    const recipes = await Recipe.find({ userID: userId });


    for (const recipe of recipes) {
      if (recipe.image) {
        const recipePublicIdMatch = recipe.image.match(/\/recipes\/([^\.]+)/);
        if (recipePublicIdMatch && recipePublicIdMatch[1]) {
          const recipePublicId = `recipes/${recipePublicIdMatch[1]}`;
          await cloudinary.uploader.destroy(recipePublicId);
        }
      }
    }


    await Recipe.deleteMany({ userID: userId });


    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      message: 'User and related recipes deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting profile and recipes:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}