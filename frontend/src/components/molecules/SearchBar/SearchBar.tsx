import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { clsx } from 'clsx';
import Icon from '@/components/atoms/Icon';
import Spinner from '@/components/atoms/Spinner';

export interface SearchBarProps {
  /** Current search value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Called when search is submitted */
  onSearch: (query: string) => void;
  /** Called on input change */
  onChange?: (query: string) => void;
  /** Search suggestions */
  suggestions?: string[];
  /** Loading state */
  isLoading?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Search bar with suggestions dropdown
 */
function SearchBar({
  value = '',
  placeholder = 'Rechercher...',
  onSearch,
  onChange,
  suggestions = [],
  isLoading = false,
  fullWidth = false,
  className,
}: Readonly<SearchBarProps>) {
  const [query, setQuery] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleChange = (newQuery: string) => {
    setQuery(newQuery);
    onChange?.(newQuery);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          const selected = suggestions[selectedIndex];
          setQuery(selected);
          onSearch(selected);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      className={clsx('relative', fullWidth ? 'w-full' : 'w-full max-w-md', className)}
    >
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <Icon name="search" size="md" className="text-gray-400" />
            )}
          </div>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={clsx(
              'block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-full',
              'text-accent placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-800 focus:border-transparent',
              'transition-all duration-200'
            )}
            aria-label="Recherche"
            aria-haspopup="listbox"
            aria-controls="search-suggestions"
          />

          {query && (
            <button
              type="button"
              onClick={() => handleChange('')}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-500"
              aria-label="Effacer la recherche"
            >
              <Icon name="close" size="sm" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          id="search-suggestions"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
            <li
              key={suggestion}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSuggestionClick(suggestion)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSuggestionClick(suggestion);
                }
              }}
              tabIndex={0}
              className={clsx(
                'px-4 py-3 cursor-pointer transition-colors duration-150',
                index === selectedIndex
                  ? 'bg-primary-50 text-primary-800'
                  : 'hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon name="search" size="sm" className="text-gray-400" />
                <span>{suggestion}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
