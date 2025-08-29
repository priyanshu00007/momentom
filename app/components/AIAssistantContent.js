// AIAssistantContent.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export default function AIAssistantContent() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-6 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Bot className="w-6 h-6 text-blue-600 mr-2" />
          AI Assistant
        </h2>
        <p className="text-gray-600">AI Assistant page placeholder.</p>
      </motion.div>
    </div>
  );
}
// "use client"
// import React from 'react';

// export default function AIAssistantContent() {
//     return (
//         <div className="bg-white p-6 rounded-2xl shadow-lg">
//             <h2 className="text-3xl font-bold text-gray-800 mb-4">AI Assistant</h2>
//             <p className="text-gray-600">
//                 Coming soon! This will be an AI-powered assistant to help with task suggestions, productivity tips, and more.
//             </p>
//         </div>
//     );
// }