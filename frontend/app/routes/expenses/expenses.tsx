import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'


export default function ExpensesPage () {

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [customDropdownOpen, setCustomDropdownOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('This Month')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const monthlyData = [
    { month: 'Jun', amount: 45 },
    { month: 'Jul', amount: 78 },
    { month: 'Aug', amount: 62 },
    { month: 'Sep', amount: 58 },
    { month: 'Oct', amount: 85 }
  ]

  const spendingCategories = [
    { category: 'Grocery', percent: 45, change: '+12%', amount: 385.50, color: '#9CA3AF' },
    { category: 'Restaurant', percent: 25, change: '-5%', amount: 214.20, color: '#D1D5DB' },
    { category: 'Electronics', percent: 20, change: '+8%', amount: 171.36, color: '#374151' },
    { category: 'Online', percent: 10, change: '+3%', amount: 85.68, color: '#6B7280' }
  ]

  const customPeriods = {
    'Weekly': ['This Week', 'Last Week', 'Week of Oct 14', 'Week of Oct 7', 'Week of Sep 30'],
    'Monthly': ['This Month', 'Last Month', 'September', 'August', 'July'],
    'Quarterly': ['Q4 2024', 'Q3 2024', 'Q2 2024', 'Q1 2024'],
    'Yearly': ['2024', '2023', '2022', '2021']
  }

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period)
    setCustomDropdownOpen(false)
    setExpandedCategory(null)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  const maxAmount = Math.max(...monthlyData.map(d => d.amount))

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Coming Soon Watermark */}
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <h2 className="text-8xl font-black text-cyan-600 opacity-30 transform -rotate-45 select-none whitespace-nowrap">
            COMING SOON
          </h2>
        </div>

        {/* Navbar */}

        {/* insert navbar here */}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">

          {/* Period Selector */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => {
                  setSelectedPeriod('This Month')
                  setCustomDropdownOpen(false);
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  selectedPeriod === 'This Month'
                    ? 'text-cyan-700 border-b-2 border-cyan-700 bg-cyan-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => {
                  setSelectedPeriod('Last Month');
                  setCustomDropdownOpen(false);
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  selectedPeriod === 'Last Month'
                    ? 'text-cyan-700 border-b-2 border-cyan-700 bg-cyan-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Last Month
              </button>
              <div className="flex-1 relative">
                <button
                  onClick={() => setCustomDropdownOpen(!customDropdownOpen)}
                  className={`w-full px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    !['This Month', 'Last Month'].includes(selectedPeriod)
                      ? 'text-cyan-700 border-b-2 border-cyan-700 bg-cyan-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {!['This Month', 'Last Month'].includes(selectedPeriod) ? selectedPeriod : 'Custom'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${customDropdownOpen ? 'rotate-180' : ''}`}/>
                </button>

                {customDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => {
                        setCustomDropdownOpen(false);
                        setExpandedCategory(null);
                      }}
                    ></div>
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                      {Object.entries(customPeriods).map(([category, periods]) => (
                        <div key={category} className="border-b border-gray-100 last:border-b-0">
                          <button
                            onClick={() => toggleCategory(category)}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between"
                          >
                            {category}
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`}/>
                          </button>
                          {expandedCategory === category && (
                            <div className="bg-gray-50">
                              {periods.map((period) => (
                                <button
                                  key={period}
                                  onClick={() => handlePeriodSelect(period)}
                                  className={`w-full px-6 py-2 text-left text-sm hover:bg-gray-100 ${
                                    selectedPeriod === period ? 'text-cyan-700 font-medium' : 'text-gray-700'
                                  }`}
                                >
                                  {period}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-cyan-300 transition-all duration-200">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-500">TOTAL SPENDING</div>
                </div>
                <div className="text-3xl font-bold text-gray-900">$856.74</div>
              </div>

              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-between gap-4">
                  {monthlyData.map((data, index) => {
                    const height = (data.amount / maxAmount) * 100;
                    const isLast = index === monthlyData.length - 1;
                    return (
                      <div key={data.month} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                          <div
                            className={`w-full rounded-t transition-all ${
                              isLast ? 'bg-gray-800' : 'bg-gray-400'
                            }`}
                            style={{ height: `${height}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">{data.month}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
                  <div>${maxAmount}</div>
                  <div>${Math.round(maxAmount * 0.5)}</div>
                  <div>$0</div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            {/* think about adding more content here */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-cyan-300 transition-all duration-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Total Spent</div>
                  <div className="text-2xl font-bold text-gray-900">$65.60</div>
                </div>
                <div className="pb-4 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Average Difference</div>
                  {/*will change to green + if positive, red - if negative*/}
                  <div className="text-2xl font-bold text-lime-700">+ $85.00</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Purchases</div>
                  <div className="text-2xl font-bold text-gray-900">124</div>
                </div>
              </div>
            </div>

            {/* Spending Breakdown */}
            <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-cyan-300 transition-all duration-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending Breakdown</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div className="flex items-center justify-center p-4">
                  <svg width="280" height="280" viewBox="0 0 320 320" className="overflow-visible">
                    <g transform="translate(160, 160)">
                      <circle
                        cx="0"
                        cy="0"
                        r="120"
                        fill="none"
                        stroke="#9CA3AF"
                        strokeWidth="80"
                        strokeDasharray="339 339"
                        strokeDashoffset="0"
                        transform="rotate(-90)"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="120"
                        fill="none"
                        stroke="#D1D5DB"
                        strokeWidth="80"
                        strokeDasharray="212 339"
                        strokeDashoffset="-152"
                        transform="rotate(-90)"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="120"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="80"
                        strokeDasharray="135 339"
                        strokeDashoffset="-237"
                        transform="rotate(-90)"
                      />
                    </g>
                  </svg>
                </div>

                {/* Category Table */}
                <div>
                  <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-semibold text-gray-700">Category</th>
                      <th className="text-right py-3 font-semibold text-gray-700">% Spend</th>
                      <th className="text-right py-3 font-semibold text-gray-700">Change</th>
                      <th className="text-right py-3 font-semibold text-gray-700">Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {spendingCategories.map((category, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="font-medium text-gray-900">{category.category}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-gray-700">{category.percent}%</td>
                        <td className={`py-3 text-right font-medium ${
                          category.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.change}
                        </td>
                        <td className="py-3 text-right font-medium text-gray-900">
                          ${category.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}