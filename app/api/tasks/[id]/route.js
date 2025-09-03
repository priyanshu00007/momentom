import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Task from "@/models/Task";

async function findAndVerifyTask(id, userId) {
    await connectMongoDB();
    const task = await Task.findById(id);
    if (!task) return null;
    if (task.userId !== userId) throw new Error("Forbidden");
    return task;
}

export async function PUT(request, { params }) {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        await findAndVerifyTask(params.id, userId);
        const body = await request.json();
        const updatedTask = await Task.findByIdAndUpdate(params.id, body, { new: true });
        return NextResponse.json(updatedTask);
    } catch (error) {
        if (error.message === 'Forbidden') return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        return NextResponse.json({ message: "Server Error or Task Not Found" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        await findAndVerifyTask(params.id, userId);
        await Task.findByIdAndDelete(params.id);
        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        if (error.message === 'Forbidden') return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        return NextResponse.json({ message: "Server Error or Task Not Found" }, { status: 500 });
    }
}

// // app/api/tasks/[id]/route.js
// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/mongodb";
// import Task from "@/models/Task";

// // UPDATE task
// export async function PUT(req, { params }) {
//   try {
//     await dbConnect();
//     const { id } = params;
//     const body = await req.json();
//     const updatedTask = await Task.findByIdAndUpdate(id, body, { new: true });
//     return NextResponse.json(updatedTask);
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // DELETE task
// export async function DELETE(req, { params }) {
//   try {
//     await dbConnect();
//     const { id } = params;
//     await Task.findByIdAndDelete(id);
//     return NextResponse.json({ message: "Task deleted" });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // // api/tasks/[id]/route.js
// // import { NextResponse } from 'next/server';
// // import dbConnect from '@/lib/mongodb';
// // import Task from '@/models/Task';

// // export async function PUT(request, { params }) {
// //   await dbConnect();
// //   const { id } = params;
// //   try {
// //     const body = await request.json();
// //     const updatedTask = await Task.findByIdAndUpdate(id, body, { new: true, runValidators: true });
// //     if (!updatedTask) {
// //       return NextResponse.json({ message: 'Task not found' }, { status: 404 });
// //     }
// //     return NextResponse.json(updatedTask, { status: 200 });
// //   } catch (error) {
// //     return NextResponse.json({ message: 'Failed to update task', error: error.message }, { status: 400 });
// //   }
// // }

// // export async function DELETE(request, { params }) {
// //   await dbConnect();
// //   const { id } = params;
// //   try {
// //     const deletedTask = await Task.findByIdAndDelete(id);
// //     if (!deletedTask) {
// //       return NextResponse.json({ message: 'Task not found' }, { status: 404 });
// //     }
// //     return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
// //   } catch (error) {
// //     return NextResponse.json({ message: 'Failed to delete task', error: error.message }, { status: 500 });
// //   }
// // }