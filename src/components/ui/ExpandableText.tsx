'use client';
import { useState } from 'react';

type ExpandableTextProps = {
  text: string;
  maxLength?: number; // কতগুলো অক্ষরের পর টেক্সট কাটা হবে
};

export default function ExpandableText({ text, maxLength = 100 }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // যদি টেক্সট maxLength-এর চেয়ে ছোট হয়, তাহলে পুরোটা দেখাও
  if (text.length <= maxLength) {
    return <p className="text-sm text-gray-500">{text}</p>;
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="text-sm text-gray-500">
      {isExpanded ? text : `${text.substring(0, maxLength)}... `}
      <button onClick={toggleExpand} className="text-blue-600 hover:underline font-medium ml-1">
        {isExpanded ? 'See less' : 'See more'}
      </button>
    </div>
  );
}