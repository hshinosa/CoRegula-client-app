interface InputLabelProps {
    htmlFor?: string;
    children: React.ReactNode;
    className?: string;
    required?: boolean;
}

export function InputLabel({ htmlFor, children, className = '', required }: InputLabelProps) {
    return (
        <label
            htmlFor={htmlFor}
            className={`block text-sm font-medium text-zinc-700 dark:text-zinc-300 ${className}`}
        >
            {children}
            {required && <span className="ml-1 text-warning-500">*</span>}
        </label>
    );
}
