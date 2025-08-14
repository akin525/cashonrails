import React, { useState, useRef } from 'react';
import Tooltip from '../tooltip';
import { CloseIcon } from '@/public/assets/icons';
import { cn } from '@/helpers/extras';

interface TagsInputProps {
  initialTags?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxWidth?: string;
  className?: string;
  disabled?: boolean;
  maxTags?: number;
}

const TagsInput = ({
  initialTags = [],
  onChange,
  placeholder = "Type and use comma to add tags",
  maxWidth = "200px",
  className = "",
  disabled = false,
  maxTags,
}: TagsInputProps) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTags = (newTags: string[]) => {
    setTags(newTags);
    onChange?.(newTags);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith(',')) {
      const newTag = value.slice(0, -1).trim();
      if (newTag && !tags.includes(newTag) && (!maxTags || tags.length < maxTags)) {
        updateTags([...tags, newTag]);
      }
      setInput('');
    } else {
      setInput(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      updateTags(tags.slice(0, -1));
    }
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      const newTags = input
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !tags.includes(tag));
      
      if (newTags.length && (!maxTags || tags.length + newTags.length <= maxTags)) {
        updateTags([...tags, ...newTags]);
        setInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleWrapperClick = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  return (
    <div 
      onClick={handleWrapperClick}
      className={cn(`min-h-[40px] p-2 border rounded-lg flex flex-wrap gap-2 items-center 
        ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-text'} ${className}`)}
    >
      {tags.map((tag) => (
        <Tooltip key={tag} content={tag} direction="top">
          <div
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg group 
              hover:bg-gray-200 transition-colors"
            style={{ maxWidth }}
          >
            <span className="text-sm text-gray-900 truncate">{tag}</span>
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="inline-flex items-center justify-center hover:text-gray-700 flex-shrink-0"
                aria-label={`Remove ${tag} filter`}
              >
                <CloseIcon className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
              </button>
            )}
          </div>
        </Tooltip>
      ))}
      {!disabled && (!maxTags || tags.length < maxTags) && (
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] outline-none text-sm disabled:bg-transparent"
          placeholder={tags.length === 0 ? placeholder : "Add more tags"}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default TagsInput;