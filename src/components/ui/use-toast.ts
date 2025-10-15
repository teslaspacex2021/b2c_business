// 简化的toast hook，用于显示通知
export function toast({ title, description, variant = "default" }: {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}) {
  // 使用浏览器原生alert作为临时解决方案
  // 在生产环境中，这里应该使用更复杂的toast系统
  const message = description ? `${title}\n${description}` : title;
  
  if (variant === "destructive") {
    alert(`❌ ${message}`);
  } else {
    alert(`✅ ${message}`);
  }
}

// Hook version for components that need it
export function useToast() {
  return {
    toast,
  };
}
