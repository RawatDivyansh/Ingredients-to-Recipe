// Utility functions for formatting data

export const formatCookingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
};

export const formatMatchPercentage = (percentage: number): string => {
  return `${Math.round(percentage)}% match`;
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatDifficulty = (difficulty: string): string => {
  return capitalizeFirst(difficulty);
};
