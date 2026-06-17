import { motion } from 'framer-motion';
import { Shield, ShieldCheck, Crown, Circle } from 'lucide-react';
import type { GroupMember, GroupMemberRole } from '@/types';

const headingStyle = {
    color: '#4A4A4A',
} as const;

const roleConfig: Record<GroupMemberRole, { icon: typeof Crown; label: string; color: string; bg: string }> = {
    owner: { icon: Crown, label: 'Pemilik', color: '#88161c', bg: 'rgba(136,22,28,0.1)' },
    admin: { icon: ShieldCheck, label: 'Admin', color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
    member: { icon: Shield, label: 'Anggota', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
};

interface MemberCardProps {
    member: GroupMember;
    index?: number;
    currentUserId?: string;
    isOwner?: boolean;
    onRoleChange?: (memberId: string, newRole: GroupMemberRole) => void;
    onRemove?: (memberId: string) => void;
}

export function MemberCard({ member, index = 0, currentUserId, isOwner, onRoleChange, onRemove }: MemberCardProps) {
    const role = roleConfig[member.role];
    const RoleIcon = role.icon;
    const isCurrentUser = member.user_id === currentUserId;
    const isMemberOwner = member.role === 'owner';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center gap-4 rounded-xl p-4 transition-all"
            style={{
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
        >
            <div className="relative">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                    style={{
                        background: 'rgba(136,22,28,0.08)',
                        color: '#88161c',
                    }}
                >
                    {member.user.name.charAt(0).toUpperCase()}
                </div>
                {member.is_online && (
                    <Circle
                        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500"
                    />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-semibold" style={headingStyle}>
                        {member.user.name}
                    </h4>
                    {isCurrentUser && (
                        <span className="text-xs text-gray-600">(Anda)</span>
                    )}
                </div>
                <p className="truncate text-xs text-brand-muted-dark">{member.user.email}</p>
            </div>

            <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: role.bg, color: role.color }}
            >
                <RoleIcon className="h-3 w-3" />
                {role.label}
            </div>

            {isOwner && !isMemberOwner && !isCurrentUser && (
                <div className="flex items-center gap-1">
                    {onRoleChange && (
                        <select
                            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs focus:border-brand-primary focus:outline-none"
                            value={member.role}
                            onChange={(e) => onRoleChange(member.id, e.target.value as GroupMemberRole)}
                        >
                            <option value="member">Anggota</option>
                            <option value="admin">Admin</option>
                        </select>
                    )}
                    {onRemove && (
                        <button
                            onClick={() => onRemove(member.id)}
                            className="rounded-lg px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50"
                        >
                            Hapus
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}
