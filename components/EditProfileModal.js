'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Save, 
  User, 
  Target, 
  FileText, 
  X,
  MapPin,
  Phone,
  Globe,
  Briefcase,
  Heart
} from "lucide-react";

export default function EditProfileModal({ open, onOpenChange }) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    primaryGoal: '',
    bio: '',
    skills: '',
    interests: '',
    location: '',
    phone: '',
    website: '',
    jobTitle: '',
    company: ''
  });

  useEffect(() => {
    if (user && open) {
      setFormData({
        primaryGoal: (user.unsafeMetadata?.primaryGoal) || '',
        bio: (user.unsafeMetadata?.bio) || '',
        skills: (user.unsafeMetadata?.skills) || '',
        interests: (user.unsafeMetadata?.interests) || '',
        location: (user.unsafeMetadata?.location) || '',
        phone: (user.unsafeMetadata?.phone) || '',
        website: (user.unsafeMetadata?.website) || '',
        jobTitle: (user.unsafeMetadata?.jobTitle) || '',
        company: (user.unsafeMetadata?.company) || ''
      });
    }
  }, [user, open]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updatedMetadata = {
        ...user.unsafeMetadata,
        primaryGoal: formData.primaryGoal,
        bio: formData.bio,
        skills: formData.skills,
        interests: formData.interests,
        location: formData.location,
        phone: formData.phone,
        website: formData.website,
        jobTitle: formData.jobTitle,
        company: formData.company,
        lastUpdated: new Date().toISOString()
      };

      await user.update({ unsafeMetadata: updatedMetadata });

      logActivity({
        type: 'profile_updated',
        description: 'Updated profile information',
        points: 10
      });

      alert('Profile updated successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logActivity = (activity) => {
    try {
      const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
      const newActivity = {
        id: Date.now().toString(),
        userId: user?.id,
        timestamp: new Date().toISOString(),
        ...activity
      };
      
      activities.unshift(newActivity);
      localStorage.setItem('user_activities', JSON.stringify(activities.slice(0, 100)));
      
      const stats = JSON.parse(localStorage.getItem('user_stats') || '{}');
      if (!stats[user?.id || '']) {
        stats[user?.id || ''] = {
          totalPoints: 0,
          rank: 'Beginner',
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString()
        };
      }
      stats[user?.id || ''].totalPoints += activity.points || 0;
      stats[user?.id || ''].lastActive = new Date().toISOString();
      
      if (stats[user?.id || ''].totalPoints >= 1000) stats[user?.id || ''].rank = 'Master';
      else if (stats[user?.id || ''].totalPoints >= 500) stats[user?.id || ''].rank = 'Expert';
      else if (stats[user?.id || ''].totalPoints >= 200) stats[user?.id || ''].rank = 'Advanced';
      else if (stats[user?.id || ''].totalPoints >= 50) stats[user?.id || ''].rank = 'Intermediate';
      
      localStorage.setItem('user_stats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && handleCancel()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="bg-white shadow-2xl rounded-2xl border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-blue-900 text-2xl font-bold">
                <User className="w-7 h-7 text-blue-600" />
                Edit Your Profile
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
            </CardHeader>

            <CardContent className="p-8 space-y-8 bg-gradient-to-b from-white to-blue-50">
              <motion.div 
                className="flex items-center gap-6 p-6 bg-blue-50 rounded-xl shadow-md"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Avatar className="h-24 w-24 ring-4 ring-blue-300 ring-offset-2">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'User'} />
                  <AvatarFallback className="text-2xl text-blue-800 bg-blue-100">
                    {user?.fullName?.charAt(0) || user?.primaryEmailAddress?.emailAddress?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 text-xl">{user?.fullName || 'New User'}</h3>
                  <p className="text-sm text-slate-600 italic">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Label htmlFor="primaryGoal" className="text-blue-900 flex items-center gap-2 font-semibold text-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                    Primary Learning Goal
                  </Label>
                  <Input
                    id="primaryGoal"
                    value={formData.primaryGoal}
                    onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
                    placeholder="What's your main learning goal?"
                    className="bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 transition-colors"
                  />
                </motion.div>

                <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <Label htmlFor="bio" className="text-blue-900 flex items-center gap-2 font-semibold text-lg">
                    <FileText className="w-5 h-5 text-sky-500" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px] bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 transition-colors"
                  />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <Label htmlFor="jobTitle" className="text-blue-900 flex items-center gap-2 font-semibold text-lg">
                    <Briefcase className="w-5 h-5 text-emerald-500" />
                    Job Title
                  </Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Your job title"
                    className="bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 transition-colors"
                  />
                </motion.div>
                <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <Label htmlFor="company" className="text-blue-900 font-semibold text-lg">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Company name"
                    className="bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 transition-colors"
                  />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  <Label htmlFor="location" className="text-blue-900 flex items-center gap-2 font-semibold text-lg">
                    <MapPin className="w-5 h-5 text-red-500" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
                    className="bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 transition-colors"
                  />
                </motion.div>
                <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                  <Label htmlFor="phone" className="text-blue-900 flex items-center gap-2 font-semibold text-lg">
                    <Phone className="w-5 h-5 text-blue-500" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Phone number"
                    className="bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 transition-colors"
                  />
                </motion.div>
              </div>

              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <Label htmlFor="website" className="text-blue-900 flex items-center gap-2 font-semibold text-lg">
                  <Globe className="w-5 h-5 text-cyan-500" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 transition-colors"
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                  <Label htmlFor="skills" className="text-blue-900 font-semibold text-lg">Skills</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    placeholder="JavaScript, React, Python..."
                    className="min-h-[80px] bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 transition-colors"
                  />
                </motion.div>
                <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
                  <Label htmlFor="interests" className="text-blue-900 flex items-center gap-2 font-semibold text-lg">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Interests
                  </Label>
                  <Textarea
                    id="interests"
                    value={formData.interests}
                    onChange={(e) => handleInputChange('interests', e.target.value)}
                    placeholder="Web Dev, AI, Music..."
                    className="min-h-[80px] bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 transition-colors"
                  />
                </motion.div>
              </div>

              <Separator className="my-8 bg-blue-200" />

              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 hover:text-blue-900 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
