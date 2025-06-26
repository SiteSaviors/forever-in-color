
interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
