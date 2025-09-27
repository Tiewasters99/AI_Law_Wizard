"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMiniverseStore } from '../../data/store';

const BlogExplorationModal: React.FC = () => {
  const router = useRouter();
  const { isBlogModalOpen, closeBlogModal } = useMiniverseStore();

  const handleExploreBlogs = () => {
    router.push('/blog');
    closeBlogModal();
  };

  if (!isBlogModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">📚 Blog Exploration</h2>
            <button 
              onClick={closeBlogModal} 
              className="text-white hover:text-gray-200 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Discover Our Legal Blog
            </h3>
            <p className="text-gray-600 text-sm">
              Explore our collection of legal insights, case studies, and industry updates.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⚖️</div>
                <div>
                  <div className="font-medium text-blue-800">Legal Insights</div>
                  <div className="text-sm text-blue-600">Expert analysis and commentary</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📋</div>
                <div>
                  <div className="font-medium text-green-800">Case Studies</div>
                  <div className="text-sm text-green-600">Real-world legal scenarios</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📰</div>
                <div>
                  <div className="font-medium text-purple-800">Industry News</div>
                  <div className="text-sm text-purple-600">Latest legal developments</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              onClick={closeBlogModal}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <button 
              onClick={handleExploreBlogs}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              Explore Blogs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogExplorationModal;
