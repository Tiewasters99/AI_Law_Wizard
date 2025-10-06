'use client';

import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { RoleCardData } from '../types/landing.types';
import { motion } from 'framer-motion';

interface RoleCardProps {
  roleCard: RoleCardData;
  onSelect: (role: 'client' | 'attorney') => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ roleCard, onSelect }) => {
  const { emoji, title, features, buttonText, buttonColor, role } = roleCard;

  const buttonStyles = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    green: 'bg-green-600 hover:bg-green-700 text-white'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden">
        <CardHeader className="text-center pb-4">
          <div className="text-6xl mb-4">{emoji}</div>
          <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex items-center text-gray-600"
              >
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                <span className="text-sm">{feature}</span>
              </motion.li>
            ))}
          </ul>
          
          <Button
            onClick={() => onSelect(role)}
            className={`w-full h-12 font-semibold text-base rounded-lg transition-all duration-200 ${buttonStyles[buttonColor]} shadow-md hover:shadow-lg`}
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
