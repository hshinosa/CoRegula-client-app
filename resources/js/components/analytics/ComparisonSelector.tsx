import { Check, ChevronDown, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SelectableCourse {
    id: string;
    name: string;
    code: string;
}

interface ComparisonSelectorProps {
    courses: SelectableCourse[];
    selected: string[];
    onChange: (selected: string[]) => void;
    maxItems?: number;
    className?: string;
}

export default function ComparisonSelector({
    courses,
    selected,
    onChange,
    maxItems = 3,
    className = '',
}: ComparisonSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCourse = useCallback(
        (courseId: string) => {
            if (selected.includes(courseId)) {
                onChange(selected.filter((id) => id !== courseId));
            } else if (selected.length < maxItems) {
                onChange([...selected, courseId]);
            }
        },
        [selected, onChange, maxItems],
    );

    const removeCourse = useCallback(
        (courseId: string) => {
            onChange(selected.filter((id) => id !== courseId));
        },
        [selected, onChange],
    );

    const selectedCourses = courses.filter((c) => selected.includes(c.id));

    const chipStyle = {
        background: 'rgba(136,22,28,0.06)',
        border: '1px solid rgba(136,22,28,0.12)',
        color: '#4A4A4A',
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="flex flex-wrap items-center gap-2">
                {selectedCourses.map((course) => (
                    <span
                        key={course.id}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                        style={chipStyle}
                    >
                        {course.code}
                        <button
                            type="button"
                            onClick={() => removeCourse(course.id)}
                            className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-red-100"
                        >
                            <X className="h-3 w-3 text-red-500" />
                        </button>
                    </span>
                ))}
                {selected.length < maxItems && (
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                            background: 'rgba(136,22,28,0.04)',
                            border: '1px dashed rgba(136,22,28,0.2)',
                            color: '#88161c',
                        }}
                    >
                        Tambah Kelas
                        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div
                    className="absolute left-0 top-full z-50 mt-2 max-h-60 w-72 overflow-y-auto rounded-2xl p-2 shadow-lg"
                    style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.7)',
                    }}
                >
                    {courses
                        .filter((c) => !selected.includes(c.id))
                        .map((course) => (
                            <button
                                key={course.id}
                                type="button"
                                onClick={() => toggleCourse(course.id)}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all hover:bg-gray-50"
                            >
                                <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                                    style={{ background: 'rgba(136,22,28,0.08)', color: '#88161c' }}
                                >
                                    {course.code.slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium" style={{ color: '#4A4A4A' }}>
                                        {course.name}
                                    </p>
                                    <p className="text-xs text-brand-muted-dark">{course.code}</p>
                                </div>
                            </button>
                        ))}
                    {courses.filter((c) => !selected.includes(c.id)).length === 0 && (
                        <p className="px-3 py-4 text-center text-xs text-brand-muted-dark">Semua kelas sudah dipilih</p>
                    )}
                </div>
            )}
        </div>
    );
}
