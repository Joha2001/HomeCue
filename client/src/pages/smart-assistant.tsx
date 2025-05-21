import { AITaskRecommendations } from "@/components/ai-task-recommendations";

const SmartAssistantPage = () => {
  return (
    <main className="px-4 md:px-6 py-4 md:py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Smart Assistant</h1>
        <p className="text-gray-600 mt-1">
          AI-powered recommendations and insights to help you optimize your home maintenance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AITaskRecommendations />
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-medium mb-4 text-gray-800">How It Works</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#16a1bd] text-white flex items-center justify-center font-medium">1</div>
              <div>
                <h3 className="font-medium text-gray-800">Personalized Recommendations</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Our AI analyzes your maintenance history and preferences to suggest tasks that are most relevant to you.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#16a1bd] text-white flex items-center justify-center font-medium">2</div>
              <div>
                <h3 className="font-medium text-gray-800">Predictive Task Management</h3>
                <p className="text-gray-600 text-sm mt-1">
                  The system predicts upcoming maintenance needs based on patterns in your task history and your home's characteristics.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#16a1bd] text-white flex items-center justify-center font-medium">3</div>
              <div>
                <h3 className="font-medium text-gray-800">Schedule Optimization</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Get suggestions on how to better distribute your tasks to avoid overload and ensure nothing important is missed.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#16a1bd] text-white flex items-center justify-center font-medium">4</div>
              <div>
                <h3 className="font-medium text-gray-800">Regional Awareness</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Recommendations factor in your location and climate region for seasonally appropriate maintenance tasks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SmartAssistantPage;