import React, { useState } from 'react';
import { MonthPicker } from '../components/MonthPicker';
import { MonthlyTransactions } from '../components/monthly/MonthlyTransactions';
import { MonthlySummaryView } from '../components/monthly/MonthlySummaryView';
import { EditTransactionDialog } from '../components/EditTransactionDialog';
import { TransactionsByCategory } from '../components/TransactionsByCategory';
import { TransactionsByPaymentMethod } from '../components/TransactionsByPaymentMethod';
import { MonthlySummaryDialog } from '../components/MonthlySummaryDialog';
import { useStore } from '../store';
import { Transaction } from '../types';
import { filterTransactionsByMonth } from '../utils/transactions';
import { TabButton } from '../components/common';
import { format } from 'date-fns';
import { exportToTSV, getExportFileName } from '../utils/export/tsv';
import { Download, Trash2, AlertCircle, Wallet2, BarChart2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { TransactionSearch } from '../components/TransactionSearch';

interface MonthlyTabProps {
  initialDate?: Date | null;
  onEditTransaction?: (transaction: Transaction) => void;
}

export function MonthlyTab({ initialDate, onEditTransaction }: MonthlyTabProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [activeView, setActiveView] = useState<'transactions' | 'summary'>('transactions');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[] | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [showNoDataDialog, setShowNoDataDialog] = useState<'download' | 'delete' | null>(null);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [exportedFileName, setExportedFileName] = useState('');
  
  const { transactions, deleteTransaction } = useStore();

  // Filter transactions for the selected month
  const monthlyTransactions = filterTransactionsByMonth(transactions, selectedDate);

  // Use filtered transactions if available, otherwise use monthly transactions
  const displayTransactions = filteredTransactions || monthlyTransactions;

  const handleExport = () => {
    try {
      const fileName = `expense-tracker-${format(selectedDate, 'yyyy-MM')}-${getExportFileName()}`;
      const tsvContent = exportToTSV(monthlyTransactions);
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportedFileName(fileName);
      setShowExportSuccess(true);
      setShowDownloadConfirm(false);
      setTimeout(() => setShowExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleDelete = () => {
    monthlyTransactions.forEach(transaction => {
      deleteTransaction(transaction.id);
    });
    setShowDeleteConfirm(false);
  };

  const handleDownloadClick = () => {
    if (monthlyTransactions.length === 0) {
      setShowNoDataDialog('download');
    } else {
      setShowDownloadConfirm(true);
    }
  };

  const handleDeleteClick = () => {
    if (monthlyTransactions.length === 0) {
      setShowNoDataDialog('delete');
    } else {
      setShowDeleteConfirm(true);
    }
  };

  // Calculate totals for summary
  const revenue = monthlyTransactions
    .filter(t => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = monthlyTransactions
    .filter(t => t.type === 'outgo')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = revenue - expenses;

  // Group transactions by date
  const transactionsByDate = Object.entries(
    displayTransactions.reduce((acc, transaction) => {
      const date = transaction.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>)
  ).sort(([a], [b]) => b.localeCompare(a));

  const handleEditTransaction = (transaction: Transaction) => {
    if (onEditTransaction) {
      onEditTransaction(transaction);
    } else {
      setEditingTransaction(transaction);
    }
  };

  return (
    <div className="space-y-4">
      {showExportSuccess && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg animate-fade-out">
          Successfully exported to {exportedFileName}
        </div>
      )}

      <MonthPicker selectedDate={selectedDate} onChange={setSelectedDate} />

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Wallet2 className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Monthly Summary</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSummaryDialog(true)}
              className="p-2 text-blue-700 hover:text-blue-800 hover:bg-blue-200/50 rounded-lg transition-colors"
              title="View insights"
            >
              <BarChart2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownloadClick}
              className="p-2 text-blue-700 hover:text-blue-800 hover:bg-blue-200/50 rounded-lg transition-colors"
              title="Download data"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100/50 rounded-lg transition-colors"
              title="Delete month data"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

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
      </div>

      <TransactionSearch 
        transactions={monthlyTransactions}
        onFilter={setFilteredTransactions}
      />

      <div className="flex justify-center space-x-2">
        <TabButton
          active={activeView === 'transactions'}
          onClick={() => setActiveView('transactions')}
        >
          Transactions
        </TabButton>
        <TabButton
          active={activeView === 'summary'}
          onClick={() => setActiveView('summary')}
        >
          Summary
        </TabButton>
      </div>

      {activeView === 'transactions' ? (
        <MonthlyTransactions
          transactionsByDate={transactionsByDate}
          onEditTransaction={handleEditTransaction}
        />
      ) : (
        <MonthlySummaryView 
          transactions={displayTransactions}
          onEditTransaction={handleEditTransaction}
        />
      )}

      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onTypeChange={(type) => {
            setEditingTransaction({ ...editingTransaction, type });
          }}
        />
      )}

      {selectedCategory && (
        <TransactionsByCategory
          transactions={displayTransactions.filter(t => t.category === selectedCategory)}
          categoryName={useStore.getState().getCategoryName(selectedCategory)}
          onClose={() => setSelectedCategory(null)}
          onEditTransaction={handleEditTransaction}
        />
      )}

      {selectedPaymentMethod && (
        <TransactionsByPaymentMethod
          transactions={displayTransactions.filter(t => t.paymentMethod === selectedPaymentMethod)}
          methodName={useStore.getState().getPaymentMethodName(selectedPaymentMethod)}
          onClose={() => setSelectedPaymentMethod(null)}
          onEditTransaction={handleEditTransaction}
        />
      )}

      {showSummaryDialog && (
        <MonthlySummaryDialog
          transactions={monthlyTransactions}
          selectedDate={selectedDate}
          onClose={() => setShowSummaryDialog(false)}
        />
      )}

      {/* No Data Dialog */}
      {showNoDataDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-gray-600 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-medium">No Data Available</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {showNoDataDialog === 'download' 
                ? `There are no transactions to download for ${format(selectedDate, 'MMMM yyyy')}.`
                : `There are no transactions to delete for ${format(selectedDate, 'MMMM yyyy')}.`
              }
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowNoDataDialog(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Confirmation Dialog */}
      {showDownloadConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Download Month Data</h3>
            <p className="text-gray-600 mb-4">
              This will download only the data for {format(selectedDate, 'MMMM yyyy')}. Do you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDownloadConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Delete Month Data</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete all transactions from {format(selectedDate, 'MMMM yyyy')}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}