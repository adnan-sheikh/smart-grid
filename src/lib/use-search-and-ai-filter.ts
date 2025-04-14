import { useState, useCallback, useEffect } from "react";
import { useAIFilter } from "./use-ai-filter";
import { FilterParams, SortParams } from "./schema";

interface UseSearchAndAIFilterParams<T extends FilterParams> {
  entityType: "todos" | "posts" | string;
  initialFilters?: T;
  setFilters: (filters: T | undefined) => void;
  updateFilters: (filters: T | undefined) => void;
  updateSort: (sort: SortParams | undefined) => void;
  setPage: (page: number) => void;
  filters?: T;
  placeholderText?: string;
  hasSearchField?: boolean; // Whether this entity type supports searching
  searchFieldName?: string; // The name of the search field, defaults to 'search'
}

interface AIFilterHandlers {
  prompt: string;
  setPrompt: (value: string) => void;
  response: any; 
  processing: boolean;
  submitPrompt: () => Promise<void>;
  clearPrompt: () => void;
}

interface UseSearchAndAIFilterReturn<T extends FilterParams> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: (term: string) => void;
  handleFilterUpdate: (newFilters: T | undefined) => void;
  aiFilter: AIFilterHandlers;
  isAiUpdate: boolean;
}

export function useSearchAndAIFilter<T extends FilterParams>({
  entityType,
  initialFilters,
  setFilters,
  updateFilters,
  updateSort,
  setPage,
  filters,
  placeholderText,
  hasSearchField = false,
  searchFieldName = 'search'
}: UseSearchAndAIFilterParams<T>): UseSearchAndAIFilterReturn<T> {
  // Search term state (separate from filters to avoid rerender loops)
  const [searchTerm, setSearchTerm] = useState<string>(
    hasSearchField && filters && searchFieldName in filters
      ? String(filters[searchFieldName] || '')
      : ''
  );
  
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>(
    hasSearchField && filters && searchFieldName in filters 
      ? String(filters[searchFieldName] || '') 
      : ''
  );

  // Track whether we're handling an AI update
  const [isAiUpdate, setIsAiUpdate] = useState(false);

  // Custom filter update that properly handles search terms
  const handleFilterUpdate = useCallback(
    (newFilters: T | undefined) => {
      // If this is an AI update, use the filters directly to prevent search term persistence
      if (isAiUpdate) {
        setFilters(newFilters);
        setIsAiUpdate(false);

        // Update search term if AI provides one and entity supports search
        if (hasSearchField) {
          if (newFilters && searchFieldName in newFilters) {
            const searchValue = newFilters[searchFieldName];
            const searchStr = searchValue !== undefined ? String(searchValue) : '';
            setSearchTerm(searchStr);
            setActiveSearchTerm(searchStr);
          } else if (
            newFilters && 
            Object.prototype.hasOwnProperty.call(newFilters, searchFieldName) && 
            newFilters[searchFieldName] === undefined
          ) {
            // AI explicitly cleared the search
            setSearchTerm('');
            setActiveSearchTerm('');
          }
        }

        return;
      }

      // For normal updates with search capability
      if (hasSearchField) {
        if (activeSearchTerm) {
          if (!newFilters) {
            // Just use search term as filter if no other filters
            setFilters({ [searchFieldName]: activeSearchTerm } as unknown as T);
          } else if (
            !(searchFieldName in newFilters) ||
            newFilters[searchFieldName] !== activeSearchTerm
          ) {
            // Add search term to existing filters
            setFilters({ ...newFilters, [searchFieldName]: activeSearchTerm } as T);
          } else {
            // Search already in filters, use as is
            setFilters(newFilters);
          }
        } else {
          // No active search term, remove search from filters if present
          if (newFilters && searchFieldName in newFilters) {
            const { [searchFieldName]: _, ...rest } = newFilters as any;
            setFilters(Object.keys(rest).length > 0 ? (rest as T) : undefined);
          } else {
            setFilters(newFilters);
          }
        }
      } else {
        // No search capability, just update filters directly
        setFilters(newFilters);
      }
    },
    [setFilters, activeSearchTerm, isAiUpdate, hasSearchField, searchFieldName]
  );

  // Effect to handle changes in active search term
  useEffect(() => {
    if (!isAiUpdate && hasSearchField) {
      handleFilterUpdate(filters);
    }
  }, [activeSearchTerm, handleFilterUpdate, filters, isAiUpdate, hasSearchField]);

  // Use our backend AI filter hook with custom callbacks
  const aiFilter = useAIFilter({
    entityType,
    onFilterChange: (newFilters) => {
      // Set the flag to indicate this is an AI-driven update
      setIsAiUpdate(true);

      // Update the filters directly
      updateFilters(newFilters as T);

      // Reset to page 1 for new filter set
      setPage(1);
    },
    onSortChange: (newSort) => {
      updateSort(newSort);
      setPage(1);
    },
  });

  // Handle AI prompt submission to ensure filter state is cleared
  const handleAiPromptSubmit = useCallback(() => {
    // Clear the flag when a new prompt is submitted
    setIsAiUpdate(true);
    return aiFilter.submitPrompt();
  }, [aiFilter, setIsAiUpdate]);

  // Handle search execution
  const handleSearch = useCallback((term: string) => {
    setActiveSearchTerm(term);
    setPage(1);
  }, [setActiveSearchTerm, setPage]);

  return {
    searchTerm,
    setSearchTerm,
    handleSearch,
    handleFilterUpdate,
    aiFilter: {
      prompt: aiFilter.prompt,
      setPrompt: aiFilter.setPrompt,
      response: aiFilter.response,
      processing: aiFilter.processing,
      submitPrompt: handleAiPromptSubmit,
      clearPrompt: aiFilter.clearPrompt,
    },
    isAiUpdate,
  };
}