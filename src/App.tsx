import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { RecordTab } from './tabs/RecordTab';
import { MonthlyTab } from './tabs/MonthlyTab';
import { TotalTab } from './tabs/TotalTab';
import { SettingsTab } from './tabs/SettingsTab';
import { Transaction } from './types';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setActiveTab(0); // Switch to Record tab
  };

  const handleMonthSelect = (date: Date) => {
    setSelectedDate(date);
    setActiveTab(1); // Switch to Monthly tab
  };

  const tabs = [
    <RecordTab 
      key="record" 
      initialTransaction={editingTransaction}
      onTransactionSaved={() => setEditingTransaction(null)}
    />,
    <MonthlyTab 
      key="monthly" 
      initialDate={selectedDate}
      onEditTransaction={handleEditTransaction}
    />,
    <TotalTab 
      key="total" 
      onMonthSelect={handleMonthSelect}
    />,
    <SettingsTab key="settings" />
  ];

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {tabs[activeTab]}
    </Layout>
  );
}

export default App;
