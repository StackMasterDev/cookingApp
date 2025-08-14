import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/models/Recipe';
import User from '@/models/User';


/*
function that returns recipes based on user id
*/
export async function GET(request, { params }) {

  try {
    await dbConnect();

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;


    const user = await User.findById(id).select('name');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const skip = (page - 1) * limit;

    const recipes = await Recipe.find({ userID: id })
      .populate('userID', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Recipe.countDocuments({ userID: id });

    return NextResponse.json({
      user,
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user recipes:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}