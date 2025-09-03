// components/TaskCard.jsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Clock, Zap, Calendar, Play, Edit, Trash2 } from "lucide-react";

export default function TaskCard({
  task,
  index,
  onStart,
  onEdit,
  onDelete,
  onToggleComplete,
}) {
  const priorityColors = {
    high: "text-red-500 bg-red-500",
    medium: "text-yellow-500 bg-yellow-500",
    low: "text-green-500 bg-green-500",
  };
  const energyColors = { High: "text-blue-500", Medium: "text-orange-500", Low: "text-teal-500" };

  // CRITICAL CHANGE: Use task._id, as this comes from MongoDB
  const handleToggle = () => onToggleComplete(task._id, !task.completed);
  const handleDelete = () => onDelete(task._id);
  const handleEdit = () => onEdit(task);


  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative bg-white rounded-2xl shadow-lg p-6 border ${
        task.completed ? "border-green-300 opacity-60" : "border-gray-200"
      } hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3
          className={`text-lg font-semibold pr-4 ${
            task.completed ? "text-gray-400 line-through" : "text-gray-800"
          }`}
        >
          {task.title}
        </h3>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggle}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 ${
            task.completed ? "bg-green-500 border-green-500" : "border-gray-300"
          } flex items-center justify-center transition-all`}
        >
          {task.completed && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </motion.button>
      </div>

      <p className={`text-sm text-gray-500 mb-6 ${task.completed ? "line-through" : ""}`}>
        {task.description}
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-6">
        <div className="flex items-center text-gray-600"><Clock className="w-4 h-4 mr-2" />{task.duration} min</div>
        <div className="flex items-center text-gray-600"><Zap className={`w-4 h-4 mr-2 ${energyColors[task.energy]}`} />{task.energy}</div>
        <div className="flex items-center text-gray-600"><Calendar className="w-4 h-4 mr-2" />{format(new Date(task.date), "MMM dd")}</div>
        <div className="flex items-center text-gray-600">
            <span className={`w-2.5 h-2.5 rounded-full mr-2 ${priorityColors[task.priority]}`}></span>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </div>
      </div>

      <div className="flex justify-end space-x-2 border-t pt-4 -mx-6 px-6">
        {!task.completed && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onStart(task)}
            className="p-2 text-gray-500 hover:text-blue-500" title="Start Task">
            <Play className="w-5 h-5" />
          </motion.button>
        )}

        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleEdit}
            className="p-2 text-gray-500 hover:text-yellow-500" title="Edit Task">
            <Edit className="w-5 h-5" />
        </motion.button>

        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDelete}
            className="p-2 text-gray-500 hover:text-red-500" title="Delete Task">
            <Trash2 className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
// "use client";
// import React from "react";
// import { motion } from "framer-motion";
// import { format } from "date-fns";
// import { Clock, Zap, Calendar, Play, Edit, Trash2 } from "lucide-react";

// export default function TaskCard({
//   task,
//   index,
//   onStart,
//   onEdit,
//   onDelete,
//   onToggleComplete,
// }) {
//   const priorityColors = {
//     high: "text-red-500",
//     medium: "text-yellow-500",
//     low: "text-green-500",
//   };

//   const energyColors = {
//     High: "text-blue-500",
//     Medium: "text-orange-500",
//     Low: "text-teal-500",
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       transition={{ duration: 0.3, delay: index * 0.05 }}
//       className={`relative bg-white rounded-2xl shadow-lg p-6 border ${
//         task.completed ? "border-green-300" : "border-gray-200"
//       } hover:border-blue-500 transition-all duration-200 ease-in-out transform hover:-translate-y-1`}
//     >
//       {/* Title + Complete Toggle */}
//       <div className="flex justify-between items-start mb-4">
//         <h3
//           className={`text-lg sm:text-xl font-semibold ${
//             task.completed ? "text-gray-400 line-through" : "text-gray-800"
//           }`}
//         >
//           {task.title}
//         </h3>

//         <motion.button
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => onToggleComplete(task)}
//           className={`w-6 h-6 rounded-full border-2 ${
//             task.completed ? "bg-green-500 border-green-500" : "border-gray-300"
//           } flex items-center justify-center transition-all duration-200`}
//         >
//           {task.completed && (
//             <svg
//               className="w-4 h-4 text-white"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M5 13l4 4L19 7"
//               ></path>
//             </svg>
//           )}
//         </motion.button>
//       </div>

//       {/* Description */}
//       <p
//         className={`text-sm sm:text-base text-gray-500 mb-4 ${
//           task.completed ? "line-through" : ""
//         }`}
//       >
//         {task.description}
//       </p>

//       {/* Task Info */}
//       <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm mb-4">
//         <div className="flex items-center text-gray-500">
//           <Clock className="w-4 h-4 mr-2" />
//           <span>{task.duration} min</span>
//         </div>

//         <div className="flex items-center text-gray-500">
//           <Zap className={`w-4 h-4 mr-2 ${energyColors[task.energy]}`} />
//           <span>{task.energy} Energy</span>
//         </div>

//         <div className="flex items-center text-gray-500">
//           <Calendar className="w-4 h-4 mr-2" />
//           <span>{format(new Date(task.date), "MMM dd")}</span>
//         </div>

//         <div className="flex items-center text-gray-500">
//           <span
//             className={`w-2 h-2 rounded-full mr-2 ${
//               priorityColors[task.priority] === "text-red-500"
//                 ? "bg-red-500"
//                 : priorityColors[task.priority] === "text-yellow-500"
//                 ? "bg-yellow-500"
//                 : "bg-green-500"
//             }`}
//           ></span>
//           <span>{task.priority} Priority</span>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex justify-end space-x-2 mt-4">
//         {!task.completed && (
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => onStart(task)}
//             className="flex items-center text-blue-500 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg"
//             title="Start Task"
//           >
//             <Play className="w-5 h-5" />
//           </motion.button>
//         )}

//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => onEdit(task)}
//           className="flex items-center text-yellow-500 hover:text-yellow-600 transition-colors duration-200 p-2 rounded-lg"
//           title="Edit Task"
//         >
//           <Edit className="w-5 h-5" />
//         </motion.button>

//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => onDelete(task.id)}
//           className="flex items-center text-red-500 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg"
//           title="Delete Task"
//         >
//           <Trash2 className="w-5 h-5" />
//         </motion.button>
//       </div>
//     </motion.div>
//   );
// }
