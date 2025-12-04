import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'


export default function ExpensesPage () {

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [customDropdownOpen, setCustomDropdownOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('This Month')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const monthlyData = [
    { month: 'Aug', amount: 1245.80 },
    { month: 'Sep', amount: 1567.35 },
    { month: 'Oct', amount: 1423.90 },
    { month: 'Nov', amount: 1389.25 },
    { month: 'Dec', amount: 1856.74 }
  ]

  const spendingCategories = [
    { category: 'Groceries', percent: 32, change: '+5%', amount: 593.16, color: '#10B981', icon: '🛒' },
    { category: 'Electronics', percent: 22, change: '+15%', amount: 408.48, color: '#4F46E5', icon: '📱' },
    { category: 'Subscriptions', percent: 18, change: '-2%', amount: 334.21, color: '#F59E0B', icon: '📺' },
    { category: 'Entertainment', percent: 12, change: '+8%', amount: 222.81, color: '#8B5CF6', icon: '🎬' },
    { category: 'Clothing', percent: 8, change: '-3%', amount: 148.54, color: '#EC4899', icon: '👕' },
    { category: 'Travel', percent: 5, change: '+12%', amount: 92.84, color: '#06B6D4', icon: '✈️' },
    { category: 'Health & Beauty', percent: 2, change: '-1%', amount: 37.13, color: '#EF4444', icon: '💊' },
    { category: 'Home & Garden', percent: 1, change: '+3%', amount: 18.57, color: '#14B8A6', icon: '🏡' }
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
    <div className="flex h-[calc(100vh-4.5rem)] bg-gray-50 overflow-hidden">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Monthly Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-cyan-300 transition-all duration-200">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-500">TOTAL SPENDING</div>
                </div>
                <div className="text-2xl pb-4 font-bold text-gray-900">$1,856.74</div>
              </div>

              <div className="relative h-40">
                <div className="absolute inset-0 flex items-end justify-around pl-12">
                  {monthlyData.map((data, index) => {
                    const height = (data.amount / maxAmount) * 100;
                    const isLast = index === monthlyData.length - 1;
                    return (
                      <div key={data.month} className="flex flex-col items-center">
                        <div className="relative group" style={{ height: '100%' }}>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                            <div
                              className={`w-8 rounded-t transition-all ${
                                isLast ? 'bg-gray-800' : 'bg-gray-400'
                              }`}
                              style={{ height: `${height * 0.01 * 160}px` }}
                            >
                            </div>
                            <div className="mt-2 text-xs text-gray-600 whitespace-nowrap">{data.month}</div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                              ${data.amount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
                  <div>${maxAmount.toFixed(0)}</div>
                  <div>${Math.round(maxAmount * 0.5)}</div>
                  <div>$0</div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-cyan-300 transition-all duration-200">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Monthly Summary</h3>
              <div className="space-y-3">
                <div className="pb-3 border-b border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Total Spent</div>
                  <div className="text-xl font-bold text-gray-900">$1,856.74</div>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">vs. Last Month</div>
                  <div className="text-xl font-bold text-red-600">+ $467.49</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Total Purchases</div>
                  <div className="text-xl font-bold text-gray-900">187</div>
                </div>
              </div>
            </div>

            {/* Spending Breakdown */}
            <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-cyan-300 transition-all duration-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Spending Breakdown</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="flex items-center justify-center p-2">
                  <svg width="240" height="240" viewBox="0 0 320 320" className="overflow-visible">
                    <g transform="translate(160, 160)">
                      {(() => {
                        const radius = 120
                        const circumference = 2 * Math.PI * radius
                        let cumulativePercent = 0

                        return spendingCategories.map((cat, idx) => {
                          const arcLength = (cat.percent / 100) * circumference
                          const offset = -(cumulativePercent / 100) * circumference
                          cumulativePercent += cat.percent

                          return (
                            <circle
                              key={idx}
                              cx="0"
                              cy="0"
                              r={radius}
                              fill="none"
                              stroke={cat.color}
                              strokeWidth="80"
                              strokeDasharray={`${arcLength} ${circumference}`}
                              strokeDashoffset={offset}
                              transform="rotate(-90)"
                            />
                          )
                        })
                      })()}
                    </g>
                  </svg>
                </div>

                {/* Category Table */}
                <div>
                  <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-semibold text-gray-700">Category</th>
                      <th className="text-right py-2 font-semibold text-gray-700">% Spend</th>
                      <th className="text-right py-2 font-semibold text-gray-700">Change</th>
                      <th className="text-right py-2 font-semibold text-gray-700">Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {spendingCategories.map((category, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-b-0">
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{category.icon}</span>
                            <span className="font-medium text-gray-900">{category.category}</span>
                          </div>
                        </td>
                        <td className="py-2 text-right text-gray-700">{category.percent}%</td>
                        <td className={`py-2 text-right font-medium ${
                          category.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.change}
                        </td>
                        <td className="py-2 text-right font-medium text-gray-900">
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
  )
}