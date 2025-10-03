export type LevelVariant = "gray" | "blue" | "purple" | "pink" | "orange" | "red";

export const getLevelVariant = (level: number): LevelVariant => {
  console.log('getLevelVariant - input level:', level, 'type:', typeof level);
  
  if (level >= 1 && level <= 9) {
    console.log('Returning gray for level:', level);
    return "gray";
  }
  if (level >= 10 && level <= 29) {
    console.log('Returning blue for level:', level);
    return "blue";
  }
  if (level >= 30 && level <= 39) {
    console.log('Returning purple for level:', level);
    return "purple";
  }
  if (level >= 40 && level <= 49) {
    console.log('Returning pink for level:', level);
    return "pink";
  }
  if (level >= 50 && level <= 74) {
    console.log('Returning orange for level:', level);
    return "orange";
  }
  if (level >= 75 && level <= 100) {
    console.log('Returning red for level:', level);
    return "red";
  }
  
  // Default to gray for levels outside the defined ranges
  console.log('Returning default gray for level:', level);
  return "gray";
};

export const getLevelVariantStyles = (variant: LevelVariant) => {
  const variants = {
    gray: {
      background: "bg-gradient-to-br from-[hsl(var(--level-gray-bg-from))] to-[hsl(var(--level-gray-bg-to))]",
      border: "bg-gradient-to-br from-[hsl(var(--level-gray-border-from))] to-[hsl(var(--level-gray-border-to))]",
      text: "bg-gradient-to-b from-[hsl(var(--level-gray-text-from))] to-[hsl(var(--level-gray-text-to))]",
    },
    blue: {
      background: "bg-gradient-to-br from-[hsl(var(--level-blue-bg-from))] to-[hsl(var(--level-blue-bg-to))]",
      border: "bg-gradient-to-br from-[hsl(var(--level-blue-border-from))] to-[hsl(var(--level-blue-border-to))]",
      text: "bg-gradient-to-b from-[hsl(var(--level-blue-text-from))] to-[hsl(var(--level-blue-text-to))]",
    },
    purple: {
      background: "bg-gradient-to-br from-[hsl(var(--level-purple-bg-from))] to-[hsl(var(--level-purple-bg-to))]",
      border: "bg-gradient-to-br from-[hsl(var(--level-purple-border-from))] to-[hsl(var(--level-purple-border-to))]",
      text: "bg-gradient-to-b from-[hsl(var(--level-purple-text-from))] to-[hsl(var(--level-purple-text-to))]",
    },
    pink: {
      background: "bg-gradient-to-br from-[hsl(var(--level-pink-bg-from))] to-[hsl(var(--level-pink-bg-to))]",
      border: "bg-gradient-to-br from-[hsl(var(--level-pink-border-from))] to-[hsl(var(--level-pink-border-to))]",
      text: "bg-gradient-to-b from-[hsl(var(--level-pink-text-from))] to-[hsl(var(--level-pink-text-to))]",
    },
    orange: {
      background: "bg-gradient-to-br from-[hsl(var(--level-orange-bg-from))] to-[hsl(var(--level-orange-bg-to))]",
      border: "bg-gradient-to-br from-[hsl(var(--level-orange-border-from))] to-[hsl(var(--level-orange-border-to))]",
      text: "bg-gradient-to-b from-[hsl(var(--level-orange-text-from))] to-[hsl(var(--level-orange-text-to))]",
    },
    red: {
      background: "bg-gradient-to-br from-[hsl(var(--level-red-bg-from))] to-[hsl(var(--level-red-bg-to))]",
      border: "bg-gradient-to-br from-[hsl(var(--level-red-border-from))] to-[hsl(var(--level-red-border-to))]",
      text: "bg-gradient-to-b from-[hsl(var(--level-red-text-from))] to-[hsl(var(--level-red-text-to))]",
    },
  };

  return variants[variant];
};
