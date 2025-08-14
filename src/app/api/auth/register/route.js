import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';


/*
Here we have a function that allows us to 
register and performs checks.
*/
export async function POST(request) {
  try {
    await dbConnect();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'This email address is already in use' },
        { status: 400 }
      );
    }

    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      mail: user.email
    };

    return NextResponse.json(
      { message: 'User successfully created', user: userResponse },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
