type LoadingScreenProps = {
  resource?: string; // Customizable resource text (e.g., "Loading Groups", "Saving Expense")
};

export function LoadingScreen({ resource = "Loading" }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Subtle Dot Animation */}
      <div className="flex space-x-2">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#4F32FF] to-[#ff4ecd] animate-bounce"></div>
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#4F32FF] to-[#ff4ecd] animate-bounce delay-200"></div>
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#4F32FF] to-[#ff4ecd] animate-bounce delay-400"></div>
      </div>

      {/* Resource Text */}
      <p className="mt-4 text-xl font-medium">{resource}...</p>
    </div>
  );
}
