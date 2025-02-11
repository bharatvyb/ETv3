import React from 'react';
import { Calendar, Search, PieChart, Filter, BarChart2, Download, Trash2 } from 'lucide-react';

export function MonthlyGuide() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h4 className="flex items-center gap-2 font-medium text-blue-900 mb-4">
          <Calendar className="h-5 w-5" />
          Monthly Overview
        </h4>
        <ul className="list-disc ml-5 space-y-2 text-gray-600">
          <li>View all transactions for the selected month</li>
          <li>See monthly totals and balance</li>
          <li>Browse transactions by date</li>
          <li>Track monthly spending patterns</li>
        </ul>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
        <h4 className="flex items-center gap-2 font-medium text-green-900 mb-4">
          <Search className="h-5 w-5" />
          Search & Filter
        </h4>
        <ul className="list-disc ml-5 space-y-2 text-gray-600">
          <li>Search transactions by description</li>
          <li>Filter by category or payment method</li>
          <li>Sort transactions by date or amount</li>
          <li>Quick access to specific transactions</li>
        </ul>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <h4 className="flex items-center gap-2 font-medium text-purple-900 mb-4">
          <PieChart className="h-5 w-5" />
          Analysis & Reports
        </h4>
        <ul className="list-disc ml-5 space-y-2 text-gray-600">
          <li>View category-wise breakdown</li>
          <li>Track spending by payment method</li>
          <li>Compare revenue vs expenses</li>
          <li>Analyze monthly trends</li>
        </ul>
      </div>

      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <h4 className="flex items-center gap-2 font-medium text-indigo-900 mb-4">
          <BarChart2 className="h-5 w-5" />
          Insights & Visualization
        </h4>
        <ul className="list-disc ml-5 space-y-2 text-gray-600">
          <li>View interactive graphs and charts</li>
          <li>Analyze spending patterns visually</li>
          <li>Compare category performance</li>
          <li>Track payment method usage</li>
        </ul>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
        <h4 className="flex items-center gap-2 font-medium text-orange-900 mb-4">
          <Download className="h-5 w-5" />
          Data Management
        </h4>
        <ul className="list-disc ml-5 space-y-2 text-gray-600">
          <li>Download monthly transaction data</li>
          <li>Export data in TSV format</li>
          <li>Back up specific month's data</li>
          <li>Import data into spreadsheets</li>
        </ul>
      </div>

      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
        <h4 className="flex items-center gap-2 font-medium text-red-900 mb-4">
          <Trash2 className="h-5 w-5" />
          Data Cleanup
        </h4>
        <ul className="list-disc ml-5 space-y-2 text-gray-600">
          <li>Delete all transactions for a month</li>
          <li>Clean up old or incorrect data</li>
          <li>Confirmation required for safety</li>
          <li><span className="text-red-600 font-medium">Warning:</span> This action cannot be undone!</li>
        </ul>
      </div>
    </div>
  );
}