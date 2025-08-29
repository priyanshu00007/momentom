// api/tasks/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const body = await request.json();
    const updatedTask = await Task.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updatedTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update task', error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete task', error: error.message }, { status: 500 });
  }
}