import * as Icons from 'lucide-react';

export const getIcon = (iconName) => {
  // Try direct match first (how it's imported)
  if (Icons[iconName] && typeof Icons[iconName] === 'function') {
    return Icons[iconName];
  }
  
  // Convert kebab-case to PascalCase (for "check-circle" → "CheckCircle")
  if (typeof iconName === 'string' && iconName.includes('-')) {
    const pascalCase = iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    if (Icons[pascalCase] && typeof Icons[pascalCase] === 'function') {
      return Icons[pascalCase];
    }
  }
  
  // Convert PascalCase to kebab-case (for "CheckCircle" → "check-circle")
  if (typeof iconName === 'string' && /[A-Z]/.test(iconName)) {
    const kebabCase = iconName
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
    if (Icons[kebabCase] && typeof Icons[kebabCase] === 'function') {
      return Icons[kebabCase];
    }
  }
  
  // Fallback to Smile if icon not found
  return Icons.Smile;
};

// Export common icons for direct import
export const FileIcon = Icons.File;
export const EyeIcon = Icons.Eye;
export const PlusIcon = Icons.Plus;
export const XIcon = Icons.X;