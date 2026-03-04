import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(time: string): string {
  return time.slice(0, 5); // "HH:MM"
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getAttendanceColor(status: string): string {
  switch (status) {
    case 'present':
      return 'bg-green-100 text-green-800';
    case 'late':
      return 'bg-yellow-100 text-yellow-800';
    case 'injured':
      return 'bg-red-100 text-red-800';
    case 'absent':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getPositionAbbreviation(position: string): string {
  const map: Record<string, string> = {
    goalkeeper: 'GK',
    defender: 'DEF',
    midfielder: 'MID',
    forward: 'FWD',
    'center-back': 'CB',
    'left-back': 'LB',
    'right-back': 'RB',
    'defensive-midfielder': 'CDM',
    'central-midfielder': 'CM',
    'attacking-midfielder': 'CAM',
    'left-winger': 'LW',
    'right-winger': 'RW',
    striker: 'ST',
  };
  return map[position.toLowerCase()] || position.slice(0, 3).toUpperCase();
}
