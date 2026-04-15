interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = '加载中...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600 text-lg">{message}</p>
    </div>
  );
}
