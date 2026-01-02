// Mock environment variables first
process.env.NODE_ENV = 'test';
process.env.API_KEY = 'test-key';

// Mock modules before requiring budget
jest.mock('../../src/config/config.js', () => ({
  loadMandatorySecret: jest.fn((name) => 'test-secret')
}));

jest.mock('dotenv');
jest.mock('../../src/v1/actual-client-provider');
jest.mock('../../src/utils/utils');
jest.mock('archiver');
jest.mock('fs');
jest.mock('path');

const { Budget } = require('../../src/v1/budget');
const { getActualApiClient, getActualDataDir } = require('../../src/v1/actual-client-provider');
const { 
  currentLocalDate, 
  formatDateToISOString, 
  listSubDirectories, 
  getFileContent 
} = require('../../src/utils/utils');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

describe('Budget Module', () => {
  let mockActualApi;
  let mockArchive;

  beforeEach(() => {
    jest.clearAllMocks();

    mockActualApi = {
      loadBudget: jest.fn().mockResolvedValue(undefined),
      sync: jest.fn().mockResolvedValue(undefined),
      downloadBudget: jest.fn().mockResolvedValue(undefined),
      getBudgetMonths: jest.fn().mockResolvedValue([]),
      getBudgetMonth: jest.fn().mockResolvedValue({
        categoryGroups: [
          {
            id: 'cg1',
            categories: [
              { id: 'cat1', budgeted: 1000, carryover: 0 },
              { id: 'cat2', budgeted: 500, carryover: 0 }
            ]
          }
        ]
      }),
      setBudgetAmount: jest.fn().mockResolvedValue(undefined),
      setBudgetCarryover: jest.fn().mockResolvedValue(undefined),
      getAccounts: jest.fn().mockResolvedValue([
        { id: 'acc1', name: 'Checking', balance: 5000 }
      ]),
      getAccountBalance: jest.fn().mockResolvedValue(5000),
      createAccount: jest.fn().mockResolvedValue({ id: 'acc2' }),
      updateAccount: jest.fn().mockResolvedValue({ id: 'acc1', name: 'Updated' }),
      deleteAccount: jest.fn().mockResolvedValue(undefined),
      closeAccount: jest.fn().mockResolvedValue(undefined),
      reopenAccount: jest.fn().mockResolvedValue(undefined),
      getTransactions: jest.fn().mockResolvedValue([
        { id: 'txn1', amount: 100, payee: 'Store' }
      ]),
      addTransactions: jest.fn().mockResolvedValue(['txn2']),
      importTransactions: jest.fn().mockResolvedValue(['txn3']),
      updateTransaction: jest.fn().mockResolvedValue({ id: 'txn1', amount: 150 }),
      deleteTransaction: jest.fn().mockResolvedValue(undefined),
      batchBudgetUpdates: jest.fn().mockImplementation(callback => callback()),
      getCategories: jest.fn().mockResolvedValue([
        { id: 'cat1', name: 'Groceries' }
      ]),
      createCategory: jest.fn().mockResolvedValue({ id: 'cat2' }),
      updateCategory: jest.fn().mockResolvedValue({ id: 'cat1', name: 'Food' }),
      deleteCategory: jest.fn().mockResolvedValue(undefined),
      getCategoryGroups: jest.fn().mockResolvedValue([
        { id: 'cg1', name: 'Essential' }
      ]),
      createCategoryGroup: jest.fn().mockResolvedValue({ id: 'cg2' }),
      updateCategoryGroup: jest.fn().mockResolvedValue({ id: 'cg1', name: 'Essentials' }),
      deleteCategoryGroup: jest.fn().mockResolvedValue(undefined),
      getPayees: jest.fn().mockResolvedValue([
        { id: 'payee1', name: 'Amazon' }
      ]),
      createPayee: jest.fn().mockResolvedValue({ id: 'payee2' }),
      updatePayee: jest.fn().mockResolvedValue({ id: 'payee1', name: 'Amazon Prime' }),
      deletePayee: jest.fn().mockResolvedValue(undefined),
      holdBudgetForNextMonth: jest.fn().mockResolvedValue(undefined),
      resetBudgetHold: jest.fn().mockResolvedValue(undefined),
      runBankSync: jest.fn().mockResolvedValue(undefined),
      getRules: jest.fn().mockResolvedValue([
        { id: 'rule1', description: 'Auto-categorize' }
      ]),
      getPayeeRules: jest.fn().mockResolvedValue([
        { id: 'rule1', payeeId: 'payee1' }
      ]),
      createRule: jest.fn().mockResolvedValue({ id: 'rule2' }),
      updateRule: jest.fn().mockResolvedValue({ id: 'rule1', description: 'Updated' }),
      deleteRule: jest.fn().mockResolvedValue(undefined),
      getSchedules: jest.fn().mockResolvedValue([
        { id: 'schedule1', name: 'Monthly Rent', amount: -150000 }
      ]),
      createSchedule: jest.fn().mockResolvedValue('schedule2'),
      updateSchedule: jest.fn().mockResolvedValue({ id: 'schedule1', name: 'Updated Rent' }),
      deleteSchedule: jest.fn().mockResolvedValue(undefined),
      getBudgets: jest.fn().mockResolvedValue([
        { id: 'budget1', groupId: 'sync1', name: 'Personal Budget' }
      ]),
      shutdown: jest.fn()
    };

    mockArchive = {
      file: jest.fn().mockReturnThis(),
      finalize: jest.fn().mockResolvedValue(undefined)
    };

    getActualApiClient.mockResolvedValue(mockActualApi);
    currentLocalDate.mockReturnValue(new Date('2024-01-15'));
    formatDateToISOString.mockReturnValue('2024-01-15');
    listSubDirectories.mockReturnValue(['budget1']);
    getFileContent.mockReturnValue(JSON.stringify({
      id: 'budget1',
      groupId: 'sync1',
      name: 'Personal Budget'
    }));
    getActualDataDir.mockReturnValue('/data/actual');
    archiver.mockReturnValue(mockArchive);
    path.join.mockImplementation((...args) => args.join('/'));
  });

  describe('Budget Initialization', () => {
    it('should download budget when syncId is not cached', async () => {
      const budget = await Budget('sync-new', undefined);
      expect(mockActualApi.downloadBudget).toHaveBeenCalledWith('sync-new');
    });

    it('should download budget with password when provided', async () => {
      const budget = await Budget('sync-pwd', 'password123');
      expect(mockActualApi.downloadBudget).toHaveBeenCalledWith('sync-pwd', {
        password: 'password123'
      });
    });
  });

  describe('Months Management', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should get all budget months', async () => {
      mockActualApi.getBudgetMonths.mockResolvedValue(['2024-01', '2024-02']);
      const months = await budget.getMonths();
      expect(months).toEqual(['2024-01', '2024-02']);
    });

    it('should get a specific month', async () => {
      const month = await budget.getMonth('2024-01');
      expect(mockActualApi.getBudgetMonth).toHaveBeenCalledWith('2024-01');
      expect(month.categoryGroups).toBeDefined();
    });

    it('should get categories for a specific month', async () => {
      const categories = await budget.getMonthCategories('2024-01');
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0].id).toBe('cat1');
    });

    it('should get a specific category for a month', async () => {
      const category = await budget.getMonthCategory('2024-01', 'cat1');
      expect(category.id).toBe('cat1');
    });

    it('should get category groups for a month', async () => {
      const groups = await budget.getMonthCategoryGroups('2024-01');
      expect(groups).toHaveLength(1);
      expect(groups[0].id).toBe('cg1');
    });

    it('should get a specific category group for a month', async () => {
      const group = await budget.getMonthCategoryGroup('2024-01', 'cg1');
      expect(group.id).toBe('cg1');
    });
  });

  describe('Month Category Updates', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should update month category budgeted amount', async () => {
      await budget.updateMonthCategory('2024-01', 'cat1', { budgeted: 1500 });
      expect(mockActualApi.setBudgetAmount).toHaveBeenCalledWith('2024-01', 'cat1', 1500);
    });

    it('should update month category carryover', async () => {
      await budget.updateMonthCategory('2024-01', 'cat1', { carryover: true });
      expect(mockActualApi.setBudgetCarryover).toHaveBeenCalledWith('2024-01', 'cat1', true);
    });

    it('should update both budgeted and carryover', async () => {
      await budget.updateMonthCategory('2024-01', 'cat1', { budgeted: 1500, carryover: true });
      expect(mockActualApi.setBudgetAmount).toHaveBeenCalledWith('2024-01', 'cat1', 1500);
      expect(mockActualApi.setBudgetCarryover).toHaveBeenCalledWith('2024-01', 'cat1', true);
    });

    it('should throw error when neither budgeted nor carryover is provided', async () => {
      await expect(budget.updateMonthCategory('2024-01', 'cat1', {}))
        .rejects
        .toThrow('At least one field is required: budgeted or carryover');
    });
  });

  describe('Accounts Management', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should get all accounts', async () => {
      const accounts = await budget.getAccounts();
      expect(accounts).toHaveLength(1);
      expect(accounts[0].id).toBe('acc1');
    });

    it('should get a specific account', async () => {
      const account = await budget.getAccount('acc1');
      expect(account.id).toBe('acc1');
    });

    it('should get account balance', async () => {
      const balance = await budget.getAccountBalance('acc1', '2024-01-15');
      expect(mockActualApi.getAccountBalance).toHaveBeenCalledWith('acc1', '2024-01-15');
      expect(balance).toBe(5000);
    });

    it('should create a new account', async () => {
      const newAccount = { name: 'Savings', type: 'savings' };
      const result = await budget.createAccount(newAccount);
      expect(mockActualApi.createAccount).toHaveBeenCalledWith(newAccount);
      expect(result.id).toBe('acc2');
    });

    it('should update an account', async () => {
      const updates = { name: 'Updated Checking' };
      const result = await budget.updateAccount('acc1', updates);
      expect(mockActualApi.updateAccount).toHaveBeenCalledWith('acc1', updates);
      expect(result.id).toBe('acc1');
    });

    it('should delete an account', async () => {
      await budget.deleteAccount('acc1');
      expect(mockActualApi.deleteAccount).toHaveBeenCalledWith('acc1');
    });

    it('should close an account with transfer', async () => {
      const transferOptions = { transferAccountId: 'acc2', transferCategoryId: 'cat1' };
      await budget.closeAccount('acc1', transferOptions);
      expect(mockActualApi.closeAccount).toHaveBeenCalledWith('acc1', 'acc2', 'cat1');
    });

    it('should reopen an account', async () => {
      await budget.reopenAccount('acc1');
      expect(mockActualApi.reopenAccount).toHaveBeenCalledWith('acc1');
    });
  });

  describe('Transactions Management', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should get transactions for an account', async () => {
      const txns = await budget.getTransactions('acc1', '2024-01-01');
      expect(mockActualApi.getTransactions).toHaveBeenCalledWith('acc1', '2024-01-01', '2024-01-15');
      expect(txns).toHaveLength(1);
    });

    it('should get transactions with custom until date', async () => {
      await budget.getTransactions('acc1', '2024-01-01', '2024-01-31');
      expect(mockActualApi.getTransactions).toHaveBeenCalledWith('acc1', '2024-01-01', '2024-01-31');
    });

    it('should add a single transaction', async () => {
      const transaction = { amount: 100, payee: 'Store' };
      const result = await budget.addTransaction('acc1', transaction);
      expect(mockActualApi.addTransactions).toHaveBeenCalledWith('acc1', [transaction], {
        learnCategories: false,
        runTransfers: false
      });
      expect(result).toBe('txn2');
    });

    it('should add transaction with options', async () => {
      const transaction = { amount: 100, payee: 'Store' };
      await budget.addTransaction('acc1', transaction, { learnCategories: true, runTransfers: true });
      expect(mockActualApi.addTransactions).toHaveBeenCalledWith('acc1', [transaction], {
        learnCategories: true,
        runTransfers: true
      });
    });

    it('should add multiple transactions', async () => {
      const transactions = [
        { amount: 100, payee: 'Store1' },
        { amount: 200, payee: 'Store2' }
      ];
      const result = await budget.addTransactions('acc1', transactions);
      expect(mockActualApi.addTransactions).toHaveBeenCalledWith('acc1', transactions, {
        learnCategories: false,
        runTransfers: false
      });
    });

    it('should import transactions', async () => {
      const transactions = [{ amount: 100 }];
      await budget.importTransactions('acc1', transactions);
      expect(mockActualApi.importTransactions).toHaveBeenCalledWith('acc1', transactions);
    });

    it('should update a transaction', async () => {
      const updates = { amount: 150, payee: 'Updated Store' };
      const result = await budget.updateTransaction('txn1', updates);
      expect(mockActualApi.updateTransaction).toHaveBeenCalledWith('txn1', {
        ...updates,
        id: 'txn1'
      });
    });

    it('should delete a transaction', async () => {
      await budget.deleteTransaction('txn1');
      expect(mockActualApi.deleteTransaction).toHaveBeenCalledWith('txn1');
    });

    it('should delete multiple transactions', async () => {
      const transactionIds = ['txn1', 'txn2', 'txn3'];
      await budget.deleteTransactions(transactionIds);
      expect(mockActualApi.batchBudgetUpdates).toHaveBeenCalled();
    });

    it('should handle empty transaction array for deletion', async () => {
      await budget.deleteTransactions([]);
      expect(mockActualApi.batchBudgetUpdates).toHaveBeenCalled();
    });
  });

  describe('Categories Management', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should get all categories', async () => {
      const categories = await budget.getCategories();
      expect(categories).toHaveLength(1);
      expect(categories[0].id).toBe('cat1');
    });

    it('should get a specific category', async () => {
      const category = await budget.getCategory('cat1');
      expect(category.id).toBe('cat1');
    });

    it('should create a new category', async () => {
      const newCategory = { name: 'Entertainment' };
      const result = await budget.createCategory(newCategory);
      expect(mockActualApi.createCategory).toHaveBeenCalledWith(newCategory);
      expect(result.id).toBe('cat2');
    });

    it('should update a category', async () => {
      const updates = { name: 'Food & Groceries' };
      const result = await budget.updateCategory('cat1', updates);
      expect(mockActualApi.updateCategory).toHaveBeenCalledWith('cat1', updates);
    });

    it('should delete a category', async () => {
      const transferOptions = { transferCategoryId: 'cat2' };
      await budget.deleteCategory('cat1', transferOptions);
      expect(mockActualApi.deleteCategory).toHaveBeenCalledWith('cat1', 'cat2');
    });
  });

  describe('Category Groups Management', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should get all category groups', async () => {
      const groups = await budget.getCategoryGroups();
      expect(groups).toHaveLength(1);
      expect(groups[0].id).toBe('cg1');
    });

    it('should create a new category group', async () => {
      const newGroup = { name: 'Bills' };
      const result = await budget.createCategoryGroup(newGroup);
      expect(mockActualApi.createCategoryGroup).toHaveBeenCalledWith(newGroup);
      expect(result.id).toBe('cg2');
    });

    it('should update a category group', async () => {
      const updates = { name: 'Essential Bills' };
      const result = await budget.updateCategoryGroup('cg1', updates);
      expect(mockActualApi.updateCategoryGroup).toHaveBeenCalledWith('cg1', updates);
    });

    it('should delete a category group', async () => {
      const transferOptions = { transferCategoryId: 'cat1' };
      await budget.deleteCategoryGroup('cg1', transferOptions);
      expect(mockActualApi.deleteCategoryGroup).toHaveBeenCalledWith('cg1', 'cat1');
    });
  });

  describe('Payees Management', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should get all payees', async () => {
      const payees = await budget.getPayees();
      expect(payees).toHaveLength(1);
      expect(payees[0].id).toBe('payee1');
    });

    it('should create a new payee', async () => {
      const newPayee = { name: 'Walmart' };
      const result = await budget.createPayee(newPayee);
      expect(mockActualApi.createPayee).toHaveBeenCalledWith(newPayee);
      expect(result.id).toBe('payee2');
    });

    it('should update a payee', async () => {
      const updates = { name: 'Amazon Prime Video' };
      const result = await budget.updatePayee('payee1', updates);
      expect(mockActualApi.updatePayee).toHaveBeenCalledWith('payee1', updates);
    });

    it('should delete a payee', async () => {
      await budget.deletePayee('payee1');
      expect(mockActualApi.deletePayee).toHaveBeenCalledWith('payee1');
    });

    it('should merge payees', async () => {
      mockActualApi.mergePayees = jest.fn().mockResolvedValue(undefined);
      await budget.mergePayees('payee1', ['payee2']);
      expect(mockActualApi.mergePayees).toHaveBeenCalledWith('payee1', ['payee2']);
    });
  });

  describe('Category Transfers', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should add category transfer with from category', async () => {
      await budget.addCategoryTransfer('2024-01', {
        fromCategoryId: 'cat1',
        amount: 100
      });
      expect(mockActualApi.setBudgetAmount).toHaveBeenCalled();
    });

    it('should add category transfer with to category', async () => {
      await budget.addCategoryTransfer('2024-01', {
        toCategoryId: 'cat1',
        amount: 100
      });
      expect(mockActualApi.setBudgetAmount).toHaveBeenCalled();
    });

    it('should add category transfer with both categories', async () => {
      await budget.addCategoryTransfer('2024-01', {
        fromCategoryId: 'cat1',
        toCategoryId: 'cat2',
        amount: 100
      });
      expect(mockActualApi.setBudgetAmount).toHaveBeenCalledTimes(2);
    });

    it('should throw error when no category id is provided', async () => {
      await expect(budget.addCategoryTransfer('2024-01', { amount: 100 }))
        .rejects
        .toThrow('At least one category id is required, either fromCategoryId or toCategoryId');
    });

    it('should throw error when amount is not provided', async () => {
      await expect(budget.addCategoryTransfer('2024-01', { fromCategoryId: 'cat1' }))
        .rejects
        .toThrow('Amount is required');
    });

    it('should throw error when source category not found', async () => {
      mockActualApi.getBudgetMonth.mockResolvedValueOnce({
        categoryGroups: [{ id: 'cg1', categories: [] }]
      });
      await expect(budget.addCategoryTransfer('2024-01', {
        fromCategoryId: 'nonexistent',
        amount: 100
      }))
        .rejects
        .toThrow('Source category not found: nonexistent');
    });

    it('should throw error when destination category not found', async () => {
      mockActualApi.getBudgetMonth.mockResolvedValueOnce({
        categoryGroups: [{ id: 'cg1', categories: [] }]
      });
      await expect(budget.addCategoryTransfer('2024-01', {
        toCategoryId: 'nonexistent',
        amount: 100
      }))
        .rejects
        .toThrow('Destination category not found: nonexistent');
    });
  });

  describe('Budget Hold Management', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should hold budget for next month', async () => {
      await budget.holdBudgetForNextMonth('2024-01', 500);
      expect(mockActualApi.holdBudgetForNextMonth).toHaveBeenCalledWith('2024-01', 500);
    });

    it('should reset budget hold', async () => {
      await budget.resetBudgetHold('2024-01');
      expect(mockActualApi.resetBudgetHold).toHaveBeenCalledWith('2024-01');
    });
  });

  describe('Bank Sync', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should run bank sync without account id', async () => {
      await budget.runBankSync();
      expect(mockActualApi.runBankSync).toHaveBeenCalledWith(undefined);
    });

    it('should run bank sync with account id', async () => {
      await budget.runBankSync('acc1');
      expect(mockActualApi.runBankSync).toHaveBeenCalledWith({ accountId: 'acc1' });
    });
  });

  describe('Rules Management', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should get all rules', async () => {
      const rules = await budget.getRules();
      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe('rule1');
    });

    it('should get payee rules', async () => {
      const rules = await budget.getPayeeRules('payee1');
      expect(mockActualApi.getPayeeRules).toHaveBeenCalledWith('payee1');
      expect(rules).toHaveLength(1);
    });

    it('should create a new rule', async () => {
      const newRule = { description: 'New Rule' };
      const result = await budget.createRule(newRule);
      expect(mockActualApi.createRule).toHaveBeenCalledWith(newRule);
      expect(result.id).toBe('rule2');
    });

    it('should update a rule', async () => {
      const updates = { id: 'rule1', description: 'Updated Rule' };
      const result = await budget.updateRule(updates);
      expect(mockActualApi.updateRule).toHaveBeenCalledWith(updates);
    });

    it('should delete a rule', async () => {
      await budget.deleteRule('rule1');
      expect(mockActualApi.deleteRule).toHaveBeenCalledWith({ id: 'rule1' });
    });
  });

  describe('Schedules Management', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should get all schedules', async () => {
      const schedules = await budget.getSchedules();
      expect(mockActualApi.getSchedules).toHaveBeenCalled();
      expect(schedules).toHaveLength(1);
      expect(schedules[0].id).toBe('schedule1');
    });

    it('should get a specific schedule', async () => {
      const schedule = await budget.getSchedule('schedule1');
      expect(schedule.id).toBe('schedule1');
      expect(schedule.name).toBe('Monthly Rent');
    });

    it('should return undefined for non-existent schedule', async () => {
      const schedule = await budget.getSchedule('nonexistent');
      expect(schedule).toBeUndefined();
    });

    it('should create a new schedule', async () => {
      const newSchedule = {
        name: 'Weekly Groceries',
        amount: -50000,
        date: { frequency: 'weekly', start: '2024-01-01', endMode: 'never' }
      };
      const result = await budget.createSchedule(newSchedule);
      expect(mockActualApi.createSchedule).toHaveBeenCalledWith(newSchedule);
      expect(result).toBe('schedule2');
    });

    it('should update a schedule', async () => {
      const updates = { name: 'Updated Monthly Rent', amount: -160000 };
      const result = await budget.updateSchedule('schedule1', updates);
      expect(mockActualApi.updateSchedule).toHaveBeenCalledWith('schedule1', updates);
      expect(result.id).toBe('schedule1');
      expect(result.name).toBe('Updated Rent');
    });

    it('should delete a schedule', async () => {
      await budget.deleteSchedule('schedule1');
      expect(mockActualApi.deleteSchedule).toHaveBeenCalledWith('schedule1');
    });
  });

  describe('Budgets Management', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should get all budgets', async () => {
      const budgets = await budget.getBudgets();
      expect(budgets).toHaveLength(1);
      expect(budgets[0].id).toBe('budget1');
    });
  });

  describe('Data Export', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should export budget data as zip', async () => {
      const result = await budget.exportData('sync1');
      expect(result.fileName).toContain('.zip');
      expect(result.fileStream).toBe(mockArchive);
      expect(mockArchive.file).toHaveBeenCalledTimes(2);
    });

    it('should throw error when budget not found for sync id', async () => {
      mockActualApi.getBudgets.mockResolvedValueOnce([]);
      await expect(budget.exportData('nonexistent'))
        .rejects
        .toThrow('Budget not found for budget sync id nonexistent');
    });

    it('should include correct files in archive', async () => {
      await budget.exportData('sync1');
      const calls = mockArchive.file.mock.calls;
      expect(calls[0][0]).toContain('db.sqlite');
      expect(calls[1][0]).toContain('metadata.json');
    });

    it('should generate correct zip filename with date and budget name', async () => {
      const result = await budget.exportData('sync1');
      expect(result.fileName).toMatch(/\d{4}-\d{2}-\d{2}-Personal Budget\.zip/);
    });
  });

  describe('Shutdown', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should shutdown the budget', async () => {
      await budget.shutdown();
      expect(mockActualApi.shutdown).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    let budget;

    beforeEach(async () => {
      budget = await Budget('sync1', undefined);
    });

    it('should propagate API errors', async () => {
      const error = new Error('API Error');
      mockActualApi.getAccounts.mockRejectedValueOnce(error);
      await expect(budget.getAccounts()).rejects.toThrow('API Error');
    });

    it('should handle missing transaction responses', async () => {
      mockActualApi.addTransactions.mockResolvedValueOnce(null);
      const result = await budget.addTransaction('acc1', { amount: 100 });
      expect(result).toBeNull();
    });

    it('should handle empty transaction array responses', async () => {
      mockActualApi.addTransactions.mockResolvedValueOnce([]);
      const result = await budget.addTransaction('acc1', { amount: 100 });
      expect(result).toEqual([]);
    });
  });
});
