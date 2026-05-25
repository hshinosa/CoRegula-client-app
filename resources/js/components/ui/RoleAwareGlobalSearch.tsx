import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { GlobalSearchModal } from '@/components/ui/GlobalSearchModal';
import { useStudentGlobalSearch } from '@/hooks/useStudentGlobalSearch';
import { useLecturerGlobalSearch } from '@/hooks/useLecturerGlobalSearch';
import { SharedData } from '@/types';

interface RoleAwareGlobalSearchProps {
    open: boolean;
    onClose: () => void;
}

export function RoleAwareGlobalSearch({ open, onClose }: RoleAwareGlobalSearchProps) {
    const { auth } = usePage<SharedData>().props;
    const [query, setQuery] = useState('');
    const role = auth?.user?.role;

    const studentSearch = useStudentGlobalSearch(role === 'student' ? query : '');
    const lecturerSearch = useLecturerGlobalSearch(role === 'lecturer' ? query : '');

    const { results, isLoading, debouncedQuery } = 
        role === 'student' ? studentSearch :
        role === 'lecturer' ? lecturerSearch :
        { results: [], isLoading: false, debouncedQuery: '' };

    return (
        <GlobalSearchModal
            open={open}
            onClose={onClose}
            results={results}
            isLoading={isLoading}
            query={query}
            onQueryChange={setQuery}
            debouncedQuery={debouncedQuery}
        />
    );
}
