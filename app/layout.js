import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import './globals.css';


export const metadata = {
  title: 'Focus App',
  description: 'A modern application to boost your productivity.',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body >
        
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

// 'use client';

// import './globals.css';
// import { useState } from 'react';
// import Sidebar from './components/Sidebar';
// import { Menu } from 'lucide-react';
// import ThemeProvider from './components/ThemeProvider'; // Added this import

// // The main layout component for the entire application.
// // This component manages the state for the sidebar's visibility
// // and wraps all child pages with the layout.
// export default function RootLayout({ children }) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   // Function to close the sidebar.
//   const handleCloseSidebar = () => {
//     setIsSidebarOpen(false);
//   };

//   // Function to toggle the sidebar's state.
//   const handleToggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   return (
//     <html lang="en">
//       <head>
//         <title>FocusMate - Your Productivity Hub</title>
//         <meta name="description" content="Beautiful, modern productivity app for focus sessions, pomodoro, and task management" />
//         <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
//       </head>
//       <body>
//         <ThemeProvider> {/* Wrapped the entire layout in ThemeProvider */}
//           {/* Main application container using flex for a responsive layout */}
        
              
//               {/* Child components (pages) will be rendered here */}
//               {children}
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }
