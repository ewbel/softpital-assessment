export function useClientFilters(rawData, filters) {
  return useMemo(() => {
    if (!rawData?.length) return [];

    const { filterType, searchValue, sortBy } = filters;

    const isEmpty =
      !filterType ||
      searchValue == null ||
      (Array.isArray(searchValue) && searchValue.length === 0) ||
      (typeof searchValue === 'string' && searchValue.trim() === '');

    const filtered = isEmpty
      ? [...rawData]
      : rawData.filter((client) => {
          const fieldValue = String(client[filterType] || '').toLowerCase();
          if (Array.isArray(searchValue)) {
            return searchValue.length === 1
              ? fieldValue.includes(searchValue[0].toLowerCase())
              : searchValue.some((val) => fieldValue === val.toLowerCase());
          }
          return fieldValue.includes(searchValue.toLowerCase());
        });

    return filtered.sort((a, b) => {
      const key = isEmpty ? 'clientName' : filterType;
      const valA = String(a[key] || '');
      const valB = String(b[key] || '');
      return sortBy === 1 ? valB.localeCompare(valA) : valA.localeCompare(valB);
    });
  }, [rawData, filters]);
}