/**
 * Bottom Navigation Component
 * 
 * Mobile-first bottom navigation for main app sections.
 */

interface BottomNavProps {
  currentView: 'dashboard' | 'calendar';
  onViewChange: (view: 'dashboard' | 'calendar') => void;
}

export default function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            currentView === 'dashboard' ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-xs font-semibold">Dashboard</span>
        </button>

        <button
          onClick={() => onViewChange('calendar')}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            currentView === 'calendar' ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs font-semibold">Calendar</span>
        </button>
      </div>
    </nav>
  );
}

