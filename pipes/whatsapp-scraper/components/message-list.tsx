"use client";

import { useState } from "react";

interface Message {
  text: string;
  timestamp: string;
  sender: string;
}

interface MessageListProps {
  messages: Message[];
  highlightText?: string;
}

export default function MessageList({ messages, highlightText = "" }: MessageListProps) {
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showSenders, setShowSenders] = useState(true);
  
  // Function to highlight matching text if needed
  const highlightMatches = (text: string, query: string) => {
    if (!query.trim()) {
      return <span className="whitespace-pre-wrap">{text}</span>;
    }

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    
    return (
      <span className="whitespace-pre-wrap">
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? 
            <span key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</span> : 
            part
        )}
      </span>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">{messages.length} messages</h3>
        <div className="flex items-center space-x-4 text-sm">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showTimestamps}
              onChange={() => setShowTimestamps(!showTimestamps)}
              className="rounded"
            />
            <span>show timestamps</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showSenders}
              onChange={() => setShowSenders(!showSenders)}
              className="rounded"
            />
            <span>show senders</span>
          </label>
        </div>
      </div>
      
      <div className="h-80 overflow-y-auto border rounded-md p-4 dark:border-gray-600">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            no messages to display
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              {(showSenders || showTimestamps) && (
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {showSenders && <span>{message.sender}</span>}
                  {showTimestamps && <span>{message.timestamp}</span>}
                </div>
              )}
              <p>{highlightMatches(message.text, highlightText)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 