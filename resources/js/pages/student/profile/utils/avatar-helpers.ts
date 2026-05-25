export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const validateAvatarFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    return 'File harus berupa gambar JPEG, PNG, atau WebP';
  }

  if (file.size > maxSize) {
    return 'Ukuran file maksimal 2MB';
  }

  return null;
};