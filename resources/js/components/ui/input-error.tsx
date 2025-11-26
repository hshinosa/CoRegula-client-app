interface InputErrorProps {
    message?: string;
    className?: string;
}

export function InputError({ message, className = '' }: InputErrorProps) {
    if (!message) return null;

    return <p className={`mt-1 text-sm text-warning-500 ${className}`}>{message}</p>;
}
