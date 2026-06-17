interface Notifications {
    email: boolean;
    push: boolean;
    tasks: boolean;
    chat: boolean;
    groups: boolean;
}

interface Props {
    notifications: Notifications;
    onToggle: (key: keyof Notifications, value: boolean) => void;
}

function ToggleItem({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="min-w-0 flex-1 pr-4">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </span>
                <span className="block text-xs text-gray-600 dark:text-gray-500">
                    {description}
                </span>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    checked
                        ? 'bg-blue-500'
                        : 'bg-gray-200 dark:bg-gray-600'
                }`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
            </button>
        </label>
    );
}

const notificationItems: { key: keyof Notifications; label: string; description: string }[] = [
    {
        key: 'email',
        label: 'Notifikasi Email',
        description: 'Terima notifikasi melalui email',
    },
    {
        key: 'push',
        label: 'Notifikasi Push',
        description: 'Terima notifikasi push di browser',
    },
    {
        key: 'tasks',
        label: 'Notifikasi Tugas',
        description: 'Pengingat deadline dan tugas baru',
    },
    {
        key: 'chat',
        label: 'Notifikasi Chat',
        description: 'Pesan baru dari grup dan diskusi',
    },
    {
        key: 'groups',
        label: 'Notifikasi Grup',
        description: 'Aktivitas dan undangan grup',
    },
];

export default function NotificationPrefs({ notifications, onToggle }: Props) {
    return (
        <div className="space-y-1">
            {notificationItems.map(({ key, label, description }) => (
                <ToggleItem
                    key={key}
                    label={label}
                    description={description}
                    checked={notifications[key]}
                    onChange={(value) => onToggle(key, value)}
                />
            ))}
        </div>
    );
}