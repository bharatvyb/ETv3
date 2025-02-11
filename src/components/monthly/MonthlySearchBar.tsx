import React from 'react';
import { TransactionSearch } from '../TransactionSearch';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { TrendingUp, TrendingDown, Wallet2 } from 'lucide-react';

interface MonthlySearchBarProps {
  transactions: Transaction[];
  onFilter: (transactions: Transaction[]) => void;
  onSummaryClick: () => void;
}

export function MonthlySearchBar({ transactions, onFilter, onSummaryClick }: MonthlySearchBarProps) {
  const revenue = transactions
    .filter(t => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'outgo')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = revenue - expenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">Revenue</span>
          </div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(revenue)}
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <TrendingDown className="h-5 w-5" />
            <span className="text-sm font-medium">Expenses</span>
          </div>
          <div className="text-xl font-bold text-red-600">
            {formatCurrency(expenses)}
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Wallet2 className="h-5 w-5" />
            <span className="text-sm font-medium">Balance</span>
          </div>
          <div className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </div>
        </div>
      </div>

      <TransactionSearch 
        transactions={transactions}
        onFilter={onFilter}
      />
    </div>
  );
}