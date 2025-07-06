import React, { createContext, useState, useContext, useCallback, useMemo } from "react";

const SearchContext = createContext();

export const useSearch = () => {
    return useContext(SearchContext);
};

export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [labels, setLabels] = useState([]);
    const [sortBy, setSortBy] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback((query, searchLabels) => {
        setSearchQuery(query);
        setLabels(searchLabels || []);
        setIsSearching(!!query || (searchLabels && searchLabels.length > 0));
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchQuery("");
        setLabels([]);
        setSortBy("");
        setIsSearching(false);
    }, []);

    const value = useMemo(() => ({
        searchQuery,
        labels,
        sortBy,
        isSearching,
        setSortBy,
        handleSearch,
        handleClearSearch,
    }), [searchQuery, labels, sortBy, isSearching, handleSearch, handleClearSearch]);

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};