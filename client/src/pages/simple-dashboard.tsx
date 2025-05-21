import { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function SimpleDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data for demo purposes
  const stats = {
    today: { total: 2, completed: 1 },
    week: { total: 5, completed: 1 },
    month: { total: 8, completed: 1 },
    upcoming: 12
  };

  const todayTasks = [
    { id: 1, title: 'Check HVAC filters', details: 'Monthly maintenance', priority: 'medium', completed: false },
    { id: 2, title: 'Water plants', details: 'Weekly task', priority: 'low', completed: true }
  ];

  const upcomingTasks = [
    { id: 3, title: 'Pay mortgage', details: 'Due in 2 days • Monthly payment', priority: 'high', completed: false },
    { id: 4, title: 'Change air filter', details: 'Due in 3 days • Quarterly maintenance', priority: 'medium', completed: false },
    { id: 5, title: 'Lawn mowing', details: 'Due in 5 days • Weekly maintenance', priority: 'low', completed: false }
  ];

  const vendors = [
    { id: 1, name: 'ABC Plumbing', category: 'Plumbing', description: 'Professional plumbing services for repairs, installations, and maintenance.' },
    { id: 2, name: 'Elite Electricians', category: 'Electrical', description: 'Licensed electricians for all your electrical needs.' },
    { id: 3, name: 'Green Gardens', category: 'Landscaping', description: 'Complete landscaping and garden maintenance services.' }
  ];

  const calculatePercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const contactVendor = (vendorName: string) => {
    alert(`Contacting ${vendorName}. This feature is available in the full app.`);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Today</h3>
            <span className="text-2xl font-bold text-[#16a1bd]">{stats.today.total}</span>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-[#16a1bd] h-2.5 rounded-full" 
                style={{ width: `${calculatePercentage(stats.today.completed, stats.today.total)}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {calculatePercentage(stats.today.completed, stats.today.total)}%
            </span>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">This Week</h3>
            <span className="text-2xl font-bold text-green-500">{stats.week.total}</span>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${calculatePercentage(stats.week.completed, stats.week.total)}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {calculatePercentage(stats.week.completed, stats.week.total)}%
            </span>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">This Month</h3>
            <span className="text-2xl font-bold text-yellow-500">{stats.month.total}</span>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-yellow-500 h-2.5 rounded-full" 
                style={{ width: `${calculatePercentage(stats.month.completed, stats.month.total)}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {calculatePercentage(stats.month.completed, stats.month.total)}%
            </span>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming</h3>
            <span className="text-2xl font-bold text-gray-500">{stats.upcoming}</span>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: "0%" }}></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">0%</span>
          </div>
        </Card>
      </div>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Recent Tasks</h3>
        <div className="space-y-3">
          {todayTasks.concat(upcomingTasks.slice(0, 1)).map(task => (
            <div key={task.id} className="flex items-center p-2 border-b last:border-b-0">
              <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mr-3 ${task.completed ? 'bg-[#16a1bd] border-[#16a1bd]' : 'border-gray-300'}`}>
                {task.completed && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <div className="flex-grow">
                <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</p>
                <p className="text-sm text-gray-500">{task.details}</p>
              </div>
              <span className={`text-xs font-medium py-1 px-2 rounded-full ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderTodayTab = () => (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-3">Today's Tasks</h3>
      {todayTasks.length > 0 ? (
        <div className="space-y-3">
          {todayTasks.map(task => (
            <div key={task.id} className="flex items-center p-2 border-b last:border-b-0">
              <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mr-3 ${task.completed ? 'bg-[#16a1bd] border-[#16a1bd]' : 'border-gray-300'}`}>
                {task.completed && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <div className="flex-grow">
                <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</p>
                <p className="text-sm text-gray-500">{task.details}</p>
              </div>
              <span className={`text-xs font-medium py-1 px-2 rounded-full ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p>No tasks scheduled for today.</p>
        </div>
      )}
    </Card>
  );

  const renderUpcomingTab = () => (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-3">Upcoming Tasks</h3>
      {upcomingTasks.length > 0 ? (
        <div className="space-y-3">
          {upcomingTasks.map(task => (
            <div key={task.id} className="flex items-center p-2 border-b last:border-b-0">
              <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mr-3 ${task.completed ? 'bg-[#16a1bd] border-[#16a1bd]' : 'border-gray-300'}`}>
                {task.completed && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <div className="flex-grow">
                <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</p>
                <p className="text-sm text-gray-500">{task.details}</p>
              </div>
              <span className={`text-xs font-medium py-1 px-2 rounded-full ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p>No upcoming tasks scheduled.</p>
        </div>
      )}
    </Card>
  );

  const renderCalendarTab = () => (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-3">Calendar View</h3>
      <div className="text-center py-6">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Calendar View</h3>
        <p className="mt-1 text-sm text-gray-500">Calendar feature is available in the full app.</p>
      </div>
    </Card>
  );

  const renderVendorsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vendors.map(vendor => (
        <Card key={vendor.id} className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 rounded-md bg-[#16a1bd]/10 text-[#16a1bd] flex items-center justify-center font-bold text-lg mr-3">
              {vendor.name.split(' ').map(word => word[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold">{vendor.name}</h3>
              <p className="text-sm text-gray-500">{vendor.category}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">{vendor.description}</p>
          <button 
            onClick={() => contactVendor(vendor.name)}
            className="w-full py-2 border border-[#16a1bd] text-[#16a1bd] rounded-md hover:bg-[#16a1bd]/5"
          >
            Contact
          </button>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#16a1bd] to-[#0d8b9e] bg-clip-text text-transparent mb-2">
          Welcome Back, Demo User
        </h1>
        <p className="text-gray-600">Here's what you need to tackle today.</p>
        <button className="mt-4 px-4 py-2 bg-gradient-to-r from-[#16a1bd] to-[#0d789c] text-white rounded-md shadow-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Task
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar">
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'overview' ? 'bg-[#16a1bd] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'today' ? 'bg-[#16a1bd] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('today')}
          >
            Today
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'upcoming' ? 'bg-[#16a1bd] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'calendar' ? 'bg-[#16a1bd] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'vendors' ? 'bg-[#16a1bd] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('vendors')}
          >
            Vendors
          </button>
        </div>
      </div>
      
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'today' && renderTodayTab()}
        {activeTab === 'upcoming' && renderUpcomingTab()}
        {activeTab === 'calendar' && renderCalendarTab()}
        {activeTab === 'vendors' && renderVendorsTab()}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-3 px-4 flex justify-around">
        <button 
          className={`flex flex-col items-center ${activeTab === 'overview' ? 'text-[#16a1bd]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('overview')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1">Home</span>
        </button>
        <button 
          className={`flex flex-col items-center ${activeTab === 'today' ? 'text-[#16a1bd]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('today')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs mt-1">Today</span>
        </button>
        <button 
          className={`flex flex-col items-center ${activeTab === 'upcoming' ? 'text-[#16a1bd]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs mt-1">Upcoming</span>
        </button>
        <button 
          className={`flex flex-col items-center ${activeTab === 'calendar' ? 'text-[#16a1bd]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('calendar')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs mt-1">Calendar</span>
        </button>
        <button 
          className={`flex flex-col items-center ${activeTab === 'vendors' ? 'text-[#16a1bd]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('vendors')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xs mt-1">Vendors</span>
        </button>
      </div>
    </div>
  );
}