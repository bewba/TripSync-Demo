import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toSnakeCase(v));
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .toLowerCase();

      (result as any)[snakeKey] = toSnakeCase((obj as any)[key]);
      return result;
    }, {});
  }
  return obj;
}

export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      (result as any)[camelKey] = toCamelCase((obj as any)[key]);
      return result;
    }, {});
  }
  return obj;
}

export const parseTimeToMinutes = (timeStr?: string | number) => {
  if (!timeStr) return 0;
  if (typeof timeStr === 'number') return timeStr;
  if (typeof timeStr !== 'string') timeStr = String(timeStr);
  const hMatch = timeStr.match(/(\d+)\s*h/);
  const mMatch = timeStr.match(/(\d+)\s*m/);
  const sMatch = timeStr.match(/(\d+)\s*s/);
  let mins = 0;
  if (hMatch) mins += parseInt(hMatch[1]) * 60;
  if (mMatch) mins += parseInt(mMatch[1]);
  if (sMatch) mins += parseInt(sMatch[1]) / 60;
  return mins || parseFloat(timeStr) || 0;
};

export const getTripFlagThresholds = (estTime?: string | number) => {
  let timeMultiplier = 1.1;
  let distMultiplier = 1.2;

  if (estTime) {
    const estMins = parseTimeToMinutes(estTime);
    if (estMins < 30) {
      timeMultiplier = 1.5;
      distMultiplier = 1.4;
    } else if (estMins < 60) {
      timeMultiplier = 1.3;
      distMultiplier = 1.3;
    } else {
      timeMultiplier = 1.1;
      distMultiplier = 1.2;
    }
  }

  return { timeMultiplier, distMultiplier };
};