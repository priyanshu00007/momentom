'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  CheckSquare, 
  Edit, 
  Flame, 
  Target, 
  Calendar,
  Trophy,
  Activity,
  Palette,
  Brain,
  MessageCircle,
  FileText,
  Star,
  TrendingUp,
  MapPin,
  Briefcase,
  Globe,
  Phone,
  Heart,
  Sparkles
} from "lucide-react";
import EditProfileModal from './EditProfileModal';

const containerVariants = { 
  hidden: { opacity: 0 }, 
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } } 
};
const itemVariants = { 
  hidden: { y: 20, opacity: 0 }, 
  visible: { y: 0, opacity: 1 } 
};

// Activity icons mapping
const activityIcons = {
  'task_completed': CheckSquare,
  'habit_streak': Flame,
  'course_finished': BookOpen,
  'chat_message': MessageCircle,
  'whiteboard_created': Palette,
  'mindmap_created': Brain,
  'goal_achieved': Trophy,
  'profile_updated': Edit,
  'daily_login': Calendar,
  'milestone_reached': Star
};

const activityColors = {
  'task_completed': 'text-emerald-400',
  'habit_streak': 'text-amber-400',
  'course_finished': 'text-sky-400',
  'chat_message': 'text-purple-400',
  'whiteboard_created': 'text-pink-400',
  'mindmap_created': 'text-cyan-400',
  'goal_achieved': 'text-yellow-400',
  'profile_updated': 'text-gray-400',
  'daily_login': 'text-indigo-400',
  'milestone_reached': 'text-blue-400'
};

// Mock user data hook for stats like tasks, habits, etc. (using localStorage)
function useUserData() {
  const [data, setData] = useState({
    tasksCompleted: 0,
    habitStreak: { count: 0 },
    coursesFinished: 0
  });

  useEffect(() => {
    const loadData = () => {
      try {
        const storedData = JSON.parse(localStorage.getItem('user_data') || '{}');
        setData({
          tasksCompleted: storedData.tasksCompleted || 0,
          habitStreak: storedData.habitStreak || { count: 0 },
          coursesFinished: storedData.coursesFinished || 0
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadData();
  }, []);

  return data;
}

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { tasksCompleted, habitStreak, coursesFinished } = useUserData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    rank: 'Beginner',
    joinDate: null,
    lastActive: null
  });

  // Load user activities and stats
  useEffect(() => {
    if (user) {
      loadUserActivities();
      loadUserStats();
    }
  }, [user]);

  const loadUserActivities = () => {
    try {
      const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
      const userActivities = activities
        .filter(activity => activity.userId === user.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
      
      setRecentActivities(userActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const loadUserStats = () => {
    try {
      const stats = JSON.parse(localStorage.getItem('user_stats') || '{}');
      const userStatsData = stats[user.id] || {
        totalPoints: 0,
        rank: 'Beginner',
        joinDate: user.createdAt,
        lastActive: new Date().toISOString()
      };
      
      setUserStats(userStatsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const getRankColor = (rank) => {
    const rankColors = {
      'Beginner': 'bg-gray-500',
      'Intermediate': 'bg-blue-500',
      'Advanced': 'bg-purple-500',
      'Expert': 'bg-yellow-500',
      'Master': 'bg-red-500'
    };
    return rankColors[rank] || 'bg-gray-500';
  };

  const getNextRankProgress = (points) => {
    if (points < 50) return (points / 50) * 100;
    if (points < 200) return (points / 200) * 100;
    if (points < 500) return (points / 500) * 100;
    if (points < 1000) return (points / 1000) * 100;
    return 100;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-white">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <EditProfileModal open={isModalOpen} onOpenChange={setIsModalOpen} />

      <motion.div 
        className="space-y-8" 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-800 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-500" />
            My Profile
          </h1>
          <p className="text-lg text-slate-600 mt-2">
            Track your journey, showcase your achievements, and level up in Spark!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card (Spans 1 column) */}
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <Card className="bg-white/95 shadow-xl rounded-2xl overflow-hidden h-full border border-blue-100">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 flex flex-col items-center text-center relative">
                <motion.div 
                  className="absolute top-0 right-0 p-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </motion.div>
                <div className="relative">
                  <Avatar className="h-32 w-32 mb-4 ring-4 ring-blue-300 ring-offset-4 ring-offset-transparent transition-all hover:scale-105">
                    <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
                    <AvatarFallback className="text-3xl bg-blue-200 text-blue-800">
                      {user.fullName?.charAt(0) || user.primaryEmailAddress?.emailAddress?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Badge 
                    className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${getRankColor(userStats.rank)} text-white px-4 py-1 rounded-full shadow-md`}
                  >
                    {userStats.rank}
                  </Badge>
                </div>
                
                <h2 className="text-3xl font-extrabold mt-4 text-blue-900">{user.fullName || 'New User'}</h2>
                <p className="text-slate-600 text-sm italic">{user.primaryEmailAddress?.emailAddress}</p>
                
                <div className="w-full mt-4">
                  <Progress value={getNextRankProgress(userStats.totalPoints)} className="h-2 bg-blue-100" />
                  <p className="text-sm text-blue-700 mt-1">Progress to next rank: {Math.round(getNextRankProgress(userStats.totalPoints))}%</p>
                </div>

                <div className="flex items-center justify-around w-full mt-4 text-sm">
                  <div className="flex flex-col items-center">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-blue-800">{userStats.totalPoints} pts</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Calendar className="w-5 h-5 text-sky-500" />
                    <span className="text-blue-800">Joined {new Date(userStats.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 bg-gradient-to-b from-white to-blue-50">
                <Button 
                  onClick={() => setIsModalOpen(true)} 
                  variant="default" 
                  className="w-full mb-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-shadow"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>

                <Separator className="my-4 bg-blue-200" />
                
                {/* Profile Information */}
                <div className="space-y-6">
                  {/* Primary Goal */}
                  <div className="flex flex-col items-center gap-2 bg-blue-50 p-3 rounded-lg shadow-sm">
                    <Target className="w-6 h-6 text-blue-600" />
                    <p className="font-semibold text-blue-800">Primary Goal:</p>
                    <p className="text-slate-700 text-center">
                      {user.unsafeMetadata?.primaryGoal || (
                        <Button variant="link" className="p-0 text-blue-600 hover:text-blue-800" onClick={() => setIsModalOpen(true)}>
                          Set Your Goal Now
                        </Button>
                      )}
                    </p>
                  </div>

                  {/* Bio */}
                  {user.unsafeMetadata?.bio && (
                    <div className="flex flex-col items-center gap-2 bg-blue-50 p-3 rounded-lg shadow-sm">
                      <FileText className="w-6 h-6 text-sky-500" />
                      <p className="font-semibold text-blue-800">Bio:</p>
                      <p className="text-slate-700 text-center text-sm">
                        {user.unsafeMetadata.bio}
                      </p>
                    </div>
                  )}

                  {/* Job Title */}
                  {user.unsafeMetadata?.jobTitle && (
                    <div className="flex flex-col items-center gap-2 bg-blue-50 p-3 rounded-lg shadow-sm">
                      <Briefcase className="w-6 h-6 text-emerald-500" />
                      <p className="font-semibold text-blue-800">Job Title:</p>
                      <p className="text-slate-700 text-center">
                        {user.unsafeMetadata.jobTitle}
                        {user.unsafeMetadata.company && ` at ${user.unsafeMetadata.company}`}
                      </p>
                    </div>
                  )}

                  {/* Location */}
                  {user.unsafeMetadata?.location && (
                    <div className="flex flex-col items-center gap-2 bg-blue-50 p-3 rounded-lg shadow-sm">
                      <MapPin className="w-6 h-6 text-red-500" />
                      <p className="font-semibold text-blue-800">Location:</p>
                      <p className="text-slate-700 text-center">
                        {user.unsafeMetadata.location}
                      </p>
                    </div>
                  )}

                  {/* Website */}
                  {user.unsafeMetadata?.website && (
                    <div className="flex flex-col items-center gap-2 bg-blue-50 p-3 rounded-lg shadow-sm">
                      <Globe className="w-6 h-6 text-cyan-500" />
                      <p className="font-semibold text-blue-800">Website:</p>
                      <a 
                        href={user.unsafeMetadata.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-center text-sm underline"
                      >
                        {user.unsafeMetadata.website}
                      </a>
                    </div>
                  )}

                  {/* Skills */}
                  {user.unsafeMetadata?.skills && (
                    <div className="flex flex-col items-center gap-2 bg-blue-50 p-3 rounded-lg shadow-sm">
                      <Star className="w-6 h-6 text-amber-500" />
                      <p className="font-semibold text-blue-800">Skills:</p>
                      <p className="text-slate-700 text-center text-sm">
                        {user.unsafeMetadata.skills}
                      </p>
                    </div>
                  )}

                  {/* Interests */}
                  {user.unsafeMetadata?.interests && (
                    <div className="flex flex-col items-center gap-2 bg-blue-50 p-3 rounded-lg shadow-sm">
                      <Heart className="w-6 h-6 text-pink-500" />
                      <p className="font-semibold text-blue-800">Interests:</p>
                      <p className="text-slate-700 text-center text-sm">
                        {user.unsafeMetadata.interests}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="lg:col-span-3 space-y-8">
            {/* Statistics */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border-t-4 border-blue-500">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2 text-blue-900 text-2xl">
                    <TrendingUp className="w-7 h-7 text-blue-600" />
                    Statistics
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-lg">Your all-time progress and achievements.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                      className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg text-center hover:scale-105 transition-transform"
                      whileHover={{ scale: 1.05 }}
                    >
                      <CheckSquare className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                      <p className="text-4xl font-bold text-emerald-700">{tasksCompleted}</p>
                      <p className="text-base text-slate-600 mt-1">Tasks Completed</p>
                    </motion.div>
                    <motion.div 
                      className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg text-center hover:scale-105 transition-transform"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Flame className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                      <p className="text-4xl font-bold text-amber-700">{habitStreak.count} Days</p>
                      <p className="text-base text-slate-600 mt-1">Habit Streak</p>
                    </motion.div>
                    <motion.div 
                      className="p-6 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 shadow-lg text-center hover:scale-105 transition-transform"
                      whileHover={{ scale: 1.05 }}
                    >
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-sky-500" />
                      <p className="text-4xl font-bold text-sky-700">{coursesFinished}</p>
                      <p className="text-base text-slate-600 mt-1">Courses Finished</p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border-t-4 border-blue-500">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2 text-blue-900 text-2xl">
                    <Activity className="w-7 h-7 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-lg">Your latest accomplishments and interactions.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {recentActivities.map((activity, index) => {
                          const Icon = activityIcons[activity.type] || Activity;
                          const color = activityColors[activity.type] || 'text-gray-400';
                          
                          return (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                              <div className={`p-3 rounded-full bg-white shadow-md ${color}`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <p className="text-base font-medium text-blue-900">{activity.description}</p>
                                <p className="text-sm text-slate-600">
                                  {formatTimeAgo(activity.timestamp)}
                                </p>
                              </div>
                              {activity.points && (
                                <Badge variant="secondary" className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                                  +{activity.points} pts
                                </Badge>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Activity className="w-20 h-20 mx-auto mb-4 text-blue-300 animate-bounce" />
                      </motion.div>
                      <p className="text-blue-900 font-medium text-lg">No recent activity yet.</p>
                      <p className="text-sm text-slate-600 mt-2">
                        Dive into Spark and start building your streak today!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
