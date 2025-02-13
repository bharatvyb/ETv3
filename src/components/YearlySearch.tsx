import React, { useState } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Transaction } from '../types';
import { useStore } from '../store';
import { format } from 'date-fns';

interface YearlySearchProps {
  onFilter: (transactions: Transaction[]) => void;
  transactions: Transaction[];
  selectedYear: Date;
}

export function YearlySearch({ onFilter, transactions, selectedYear }: YearlySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'revenue' | 'outgo'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const { categories, paymentMethods } = useStore();

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(selectedYear.getFullYear(), i, 1);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM')
    };
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, selectedType, selectedMonth, selectedCategory, selectedPaymentMethod);
  };

  const applyFilters = (
    search: string,
    type: string,
    month: string,
    category: string,
    method: string
  ) => {
    let filtered = [...transactions];

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.memo.toLowerCase().includes(searchLower) ||
        useStore.getState().getCategoryName(t.category).toLowerCase().includes(searchLower) ||
        useStore.getState().getPaymentMethodName(t.paymentMethod).toLowerCase().includes(searchLower)
      );
    }

    // Apply month filter
    if (month !== 'all') {
      filtered = filtered.filter(t => t.date.startsWith(month));
    }

    // Apply type filter
    if (type !== 'all') {
      filtered = filtered.filter(t => t.type === type);
    }

    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(t => t.category === category);
    }

    // Apply payment method filter
    if (method !== 'all') {
      filtered = filtered.filter(t => t.paymentMethod === method);
    }

    onFilter(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedMonth('all');
    setSelectedCategory('all');
    setSelectedPaymentMethod('all');
    onFilter(transactions);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={`Search transactions in ${format(selectedYear, 'yyyy')}...`}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg border ${
            showFilters ? 'bg-blue-50 border-blue-200' : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Yearly Filters</h3>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Reset all
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  applyFilters(searchTerm, selectedType, e.target.value, selectedCategory, selectedPaymentMethod);
                }}
                className="w-full rounded-md border-gray-300"
              >
                <option value="all">All Months</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as 'all' | 'revenue' | 'outgo');
                  applyFilters(searchTerm, e.target.value, selectedMonth, selectedCategory, selectedPaymentMethod);
                }}
                className="w-full rounded-md border-gray-300"
              >
                <option value="all">All Types</option>
                <option value="revenue">Revenue</option>
                <option value="outgo">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  applyFilters(searchTerm, selectedType, selectedMonth, e.target.value, selectedPaymentMethod);
                }}
                className="w-full rounded-md border-gray-300"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => {
                  setSelectedPaymentMethod(e.target.value);
                  applyFilters(searchTerm, selectedType, selectedMonth, selectedCategory, e.target.value);
                }}
                className="w-full rounded-md border-gray-300"
              >
                <option value="all">All Methods</option>
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}