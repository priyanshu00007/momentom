"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, MessageSquare, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function AIAssistantContent() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [context, setContext] = useState('productivity');
  const messagesEndRef = useRef(null);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/ai/chat');
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.chatHistory || []);
        
        // Convert chat history to message format
        const formattedMessages = data.chatHistory.map(chat => [
          { type: 'user', content: chat.userMessage, timestamp: chat.timestamp },
          { type: 'ai', content: chat.aiResponse, timestamp: chat.timestamp }
        ]).flat();
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const aiMessage = {
          type: 'ai',
          content: data.message,
          timestamp: new Date(),
          xpGained: data.xpGained,
          newLevel: data.newLevel
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Show XP gain notification
        if (data.xpGained > 0) {
          showXPNotification(data.xpGained, data.newLevel);
        }
      } else {
        const errorData = await response.json();
        const errorMessage = {
          type: 'ai',
          content: `Sorry, I encountered an error: ${errorData.message}`,
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const showXPNotification = (xpGained, newLevel) => {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <Zap className="w-5 h-5" />
        <span>+${xpGained} XP! Level ${newLevel}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getContextIcon = (ctx) => {
    switch (ctx) {
      case 'productivity': return '⚡';
      case 'focus': return '🎯';
      case 'time-management': return '⏰';
      case 'goals': return '🎯';
      case 'motivation': return '💪';
      default: return '💬';
    }
  };

  const contextOptions = [
    { value: 'productivity', label: 'Productivity', icon: '⚡' },
    { value: 'focus', label: 'Focus & Study', icon: '🎯' },
    { value: 'time-management', label: 'Time Management', icon: '⏰' },
    { value: 'goals', label: 'Goal Setting', icon: '🎯' },
    { value: 'motivation', label: 'Motivation', icon: '💪' },
    { value: 'work-life-balance', label: 'Work-Life Balance', icon: '⚖️' }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI Assistant</h1>
            <p className="text-gray-600">Your personal productivity companion powered by AI</p>
          </div>
        </div>
        
        {/* Context Selector */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chat Context:</label>
          <div className="flex flex-wrap gap-2">
            {contextOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setContext(option.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  context === option.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to your AI Assistant!</h3>
            <p className="text-gray-600 mb-4">
              I'm here to help you with productivity, focus, time management, and more.
            </p>
            <div className="bg-white rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-600 mb-2">Try asking me:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• "How can I improve my focus?"</li>
                <li>• "Give me time management tips"</li>
                <li>• "Help me set achievable goals"</li>
                <li>• "How do I build better habits?"</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.isError
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && (
                    <Bot className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(new Date(message.timestamp), 'HH:mm')}
                    </p>
                    {message.xpGained && (
                      <div className="flex items-center space-x-1 mt-2 text-xs">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span className="text-yellow-600">+{message.xpGained} XP</span>
                      </div>
                    )}
                  </div>
                  {message.type === 'user' && (
                    <User className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about productivity, focus, time management..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>Send</span>
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          <MessageSquare className="w-4 h-4 inline mr-1" />
          Your conversations are saved and help improve your productivity score
        </div>
      </div>
    </div>
  );
}