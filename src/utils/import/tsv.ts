import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionType } from '../../types';
import { useStore } from '../../store';
import { generateEmojiIcon } from '../emoji';

interface ImportError {
  type: 'transaction' | 'category' | 'method' | 'settings';
  message: string;
  data?: any;
}

export async function parseTSV(content: string): Promise<{
  data: {
    transactions: any[];
    categories: string[];
    paymentMethods: string[];
    userSettings: Record<string, string>;
  };
  errors: ImportError[];
}> {
  const errors: ImportError[] = [];
  const result = {
    transactions: [],
    categories: new Set<string>(),
    paymentMethods: new Set<string>(),
    userSettings: {}
  };

  try {
    const lines = content.trim().split('\n');
    let currentSection: 'transactions' | 'categories' | 'methods' | 'settings' = 'transactions';
    let headers: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine === 'Categories:') {
        currentSection = 'categories';
        continue;
      } else if (trimmedLine === 'Payment Methods:') {
        currentSection = 'methods';
        continue;
      } else if (trimmedLine === 'User Settings:') {
        currentSection = 'settings';
        continue;
      }

      try {
        switch (currentSection) {
          case 'transactions':
            if (!headers.length) {
              headers = trimmedLine.split('\t');
            } else {
              const values = trimmedLine.split('\t');
              if (values.length === headers.length) {
                const transaction = {
                  date: values[0],
                  amount: values[1],
                  memo: values[2],
                  category: values[3].trim(),
                  method: values[4].trim(),
                  type: values[5].toLowerCase()
                };
                result.transactions.push(transaction);
                // Add category and payment method to their respective sets
                result.categories.add(transaction.category);
                result.paymentMethods.add(transaction.method);
              }
            }
            break;

          case 'categories':
            trimmedLine.split('\t')
              .filter(Boolean)
              .map(cat => cat.trim())
              .forEach(cat => result.categories.add(cat));
            break;

          case 'methods':
            trimmedLine.split('\t')
              .filter(Boolean)
              .map(method => method.trim())
              .forEach(method => result.paymentMethods.add(method));
            break;

          case 'settings':
            const [key, value] = trimmedLine.split('\t').map(s => s.trim());
            if (key && value) {
              result.userSettings[key.toLowerCase()] = value;
            }
            break;
        }
      } catch (error) {
        errors.push({
          type: currentSection,
          message: `Failed to parse ${currentSection} data`,
          data: trimmedLine
        });
      }
    }

    return { 
      data: {
        ...result,
        categories: Array.from(result.categories),
        paymentMethods: Array.from(result.paymentMethods)
      }, 
      errors 
    };
  } catch (error) {
    throw new Error('Invalid file format. Please ensure the file is a valid TSV export.');
  }
}

export async function transformTransactions(
  parsedData: any
): Promise<{ transactions: Transaction[]; errors: ImportError[] }> {
  const store = useStore.getState();
  const errors: ImportError[] = [];

  // Create maps for existing categories and payment methods
  const existingCategories = new Map(
    store.categories.map(c => [c.name.toLowerCase(), c])
  );
  const existingPaymentMethods = new Map(
    store.paymentMethods.map(m => [m.name.toLowerCase(), m])
  );

  // Step 1: Import categories
  try {
    for (const name of parsedData.categories) {
      const normalizedName = name.toLowerCase();
      if (!existingCategories.has(normalizedName)) {
        await new Promise(resolve => setTimeout(resolve, 0));
        store.addCategory(name);
        const newStore = useStore.getState();
        const newCategory = newStore.categories.find(
          c => c.name.toLowerCase() === normalizedName
        );
        if (newCategory) {
          existingCategories.set(normalizedName, newCategory);
        }
      }
    }
  } catch (error) {
    errors.push({
      type: 'category',
      message: 'Failed to import some categories'
    });
  }

  // Step 2: Import payment methods
  try {
    for (const name of parsedData.paymentMethods) {
      const normalizedName = name.toLowerCase();
      if (!existingPaymentMethods.has(normalizedName)) {
        await new Promise(resolve => setTimeout(resolve, 0));
        store.addPaymentMethod(name);
        const newStore = useStore.getState();
        const newMethod = newStore.paymentMethods.find(
          m => m.name.toLowerCase() === normalizedName
        );
        if (newMethod) {
          existingPaymentMethods.set(normalizedName, newMethod);
        }
      }
    }
  } catch (error) {
    errors.push({
      type: 'method',
      message: 'Failed to import some payment methods'
    });
  }

  // Step 3: Handle user settings
  if (parsedData.userSettings) {
    try {
      const settings = {
        name: parsedData.userSettings.name || '',
        currency: parsedData.userSettings.currency || 'INR'
      };
      store.updateUserSettings(settings);

      if (parsedData.userSettings['app icon']) {
        const icons = await generateEmojiIcon(parsedData.userSettings['app icon']);
        store.setAppIcon({ emoji: parsedData.userSettings['app icon'], ...icons });
      }
    } catch (error) {
      errors.push({
        type: 'settings',
        message: 'Failed to import some settings'
      });
    }
  }

  // Step 4: Create a unique key for existing transactions
  const existingTransactionKeys = new Set(
    store.transactions.map(t => 
      `${t.date}-${t.amount}-${t.memo.toLowerCase()}-${t.type}-${t.category}-${t.paymentMethod}`
    )
  );

  // Step 5: Transform transactions
  const transactions: Transaction[] = [];
  
  for (const raw of parsedData.transactions) {
    try {
      const category = existingCategories.get(raw.category.toLowerCase());
      const paymentMethod = existingPaymentMethods.get(raw.method.toLowerCase());

      if (!category || !paymentMethod) {
        errors.push({
          type: 'transaction',
          message: `Missing category or payment method for transaction: ${raw.memo}`,
          data: raw
        });
        continue;
      }

      const transactionKey = `${raw.date}-${raw.amount}-${raw.memo.toLowerCase()}-${raw.type}-${category.id}-${paymentMethod.id}`;
      
      if (existingTransactionKeys.has(transactionKey)) {
        continue; // Skip duplicate transaction
      }

      transactions.push({
        id: uuidv4(),
        date: raw.date,
        amount: parseFloat(raw.amount),
        memo: raw.memo,
        category: category.id,
        paymentMethod: paymentMethod.id,
        type: raw.type as TransactionType
      });

      // Add the key to prevent duplicates within the same import
      existingTransactionKeys.add(transactionKey);
    } catch (error) {
      errors.push({
        type: 'transaction',
        message: 'Failed to import transaction',
        data: raw
      });
    }
  }

  return { transactions, errors };
}