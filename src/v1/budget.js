
const { currentLocalDate, formatDateToISOString, listSubDirectories, getFileContent } = require('../utils/utils');
const { getActualApiClient, getActualDataDir } = require('./actual-client-provider');

const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

let syncIdToBudgetId = {};

async function Budget(budgetSyncId, budgetEncryptionPassword) {
  const actualApi = await getActualApiClient();
  if (budgetSyncId in syncIdToBudgetId) {
    await actualApi.loadBudget(syncIdToBudgetId[budgetSyncId]);
    await actualApi.sync();
  } else {
    if (budgetEncryptionPassword) {
      await actualApi.downloadBudget(budgetSyncId, {
        password: budgetEncryptionPassword
      });
    } else {
      await actualApi.downloadBudget(budgetSyncId);
    }
    refreshSincIdToBudgetIdMap();
  }

  async function getMonths() {
    return actualApi.getBudgetMonths();
  }

  async function getMonth(month) {
    return actualApi.getBudgetMonth(month);
  }

  async function getMonthCategories(month) {
    const budgetMonth = await getMonth(month);
    const categories = [];
    budgetMonth.categoryGroups.forEach((categoryGroup) => categories.push(...categoryGroup.categories));
    return categories;
  }

  async function getMonthCategory(month, categoryId) {
    const categories = await getMonthCategories(month);
    return categories.find((category) => categoryId == category.id);
  }

  async function updateMonthCategory(month, categoryId, { budgeted, carryover }) {
    if (budgeted === undefined && carryover === undefined) {
          throw new Error('At least one field is required: budgeted or carryover');
    }
    if (budgeted !== undefined) {
      await actualApi.setBudgetAmount(month, categoryId, budgeted);
    }
    if (carryover !== undefined) {
      await actualApi.setBudgetCarryover(month, categoryId, carryover);
    }
  }

  async function getMonthCategoryGroups(month) {
    const budgetMonth = await actualApi.getBudgetMonth(month);
    const categoryGroups = [];
    budgetMonth.categoryGroups.forEach((categoryGroup) => categoryGroups.push(categoryGroup));
    return categoryGroups;
  }

  async function getMonthCategoryGroup(month, categoryGroupId) {
    const categoryGroups = await getMonthCategoryGroups(month);
    return categoryGroups.find((categoryGroup) => categoryGroupId == categoryGroup.id);
  }

  async function getAccounts() {
    return actualApi.getAccounts();
  }

  async function getAccount(accountId) {
    const accounts = await getAccounts();
    return accounts.find((account) => accountId == account.id);
  }
                                                                                                
  async function getAccountBalance(accountId, cutoffDate) {                                               
    return actualApi.getAccountBalance(accountId, cutoffDate);                                                       
  } 

  async function createAccount(account) {
    return actualApi.createAccount(account);
  }

  async function updateAccount(accountId, account) {
    return actualApi.updateAccount(accountId, account);
  }

  async function deleteAccount(accountId) {
    return actualApi.deleteAccount(accountId);
  }

  async function closeAccount(accountId, {transferAccountId, transferCategoryId}) {
    return actualApi.closeAccount(accountId, transferAccountId, transferCategoryId);
  }

  async function reopenAccount(accountId) {
    return actualApi.reopenAccount(accountId);
  }

  async function getTransactions(accountId, sinceDate, optionalUntilDate) {
    const untilDate = optionalUntilDate || formatDateToISOString(currentLocalDate());
    return actualApi.getTransactions(accountId, sinceDate, untilDate);
  }

  async function addTransaction(accountId, transaction, { learnCategories = false, runTransfers = false } = {}) {
    const transactionIds = await addTransactions(accountId, [transaction], {learnCategories, runTransfers});
    if (transactionIds && Array.isArray(transactionIds) && transactionIds.length > 0) {
      return transactionIds[0];
    }
    return transactionIds;
  }

  async function addTransactions(accountId, transactions, { learnCategories = false, runTransfers = false } = {}) {
    return actualApi.addTransactions(accountId, transactions, {learnCategories, runTransfers});
  }

  async function importTransactions(accountId, transactions) {
    return actualApi.importTransactions(accountId, transactions);
  }

  async function updateTransaction(transactionId, transaction) {
    return actualApi.updateTransaction(transactionId, {...transaction, id: transactionId});
  }

  async function deleteTransaction(transactionId) {
    return actualApi.deleteTransaction(transactionId);
  }

  async function deleteTransactions(transactionIds = []) {
    return actualApi.batchBudgetUpdates(async () => {
      transactionIds.forEach(async (transactionId) => {
        await actualApi.deleteTransaction(transactionId);
      });
    });
  }

  async function getCategories() {
    return actualApi.getCategories();
  }

  async function getCategory(categoryId) {
    const categories = await getCategories();
    return categories.find((category) => categoryId == category.id);
  }

  async function createCategory(category) {
    return actualApi.createCategory(category);
  }

  async function updateCategory(categoryId, category) {
    return actualApi.updateCategory(categoryId, category);
  }

  async function deleteCategory(categoryId, {transferCategoryId}) {
    return actualApi.deleteCategory(categoryId, transferCategoryId);
  }

  async function getCategoryGroups() {
    return actualApi.getCategoryGroups();
  }

  async function createCategoryGroup(categoryGroup) {
    return actualApi.createCategoryGroup(categoryGroup);
  }

  async function updateCategoryGroup(categoryGroupId, categoryGroup) {
    return actualApi.updateCategoryGroup(categoryGroupId, categoryGroup);
  }

  async function deleteCategoryGroup(categoryGroupId, {transferCategoryId}) {
    return actualApi.deleteCategoryGroup(categoryGroupId, transferCategoryId);
  }

  async function getPayees() {
    return actualApi.getPayees();
  }

  async function createPayee(payee) {
    return actualApi.createPayee(payee);
  }

  async function updatePayee(payeeId, payee) {
    return actualApi.updatePayee(payeeId, payee);
  }

  async function deletePayee(payeeId) {
    return actualApi.deletePayee(payeeId);
  }

  async function mergePayees(targetId, mergeIds) {
    return actualApi.mergePayees(targetId, mergeIds);
  }

  async function addCategoryTransfer(month, {fromCategoryId, toCategoryId, amount}) {
    if (!(fromCategoryId || toCategoryId)) {
      throw new Error('At least one category id is required, either fromCategoryId or toCategoryId');
    }
    if (amount === undefined) {
      throw new Error('Amount is required');
    }

    if (fromCategoryId) {
      const fromMonthCategory = await getMonthCategory(month, fromCategoryId);
      if (!fromMonthCategory) {
        throw new Error(`Source category not found: ${fromCategoryId}`);
      }
      updateMonthCategory(month, fromCategoryId, { budgeted: fromMonthCategory.budgeted - amount });
    }
    if (toCategoryId) {
      const toMonthCategory = await getMonthCategory(month, toCategoryId);
      if (!toMonthCategory) {
        throw new Error(`Destination category not found: ${toCategoryId}`);
      }
      updateMonthCategory(month, toCategoryId, { budgeted: toMonthCategory.budgeted + amount });
    }
  }

  async function holdBudgetForNextMonth(month, amount) {
      return actualApi.holdBudgetForNextMonth(month, amount);
  }

  async function resetBudgetHold(month) {
    return actualApi.resetBudgetHold(month);
  }

  async function runBankSync(accountId) {
    let bankSyncArgs = undefined;
    if (accountId) {
      bankSyncArgs = {
        accountId
      };
    }
    return actualApi.runBankSync(bankSyncArgs);
  }

  async function getRules() {
    return actualApi.getRules();
  }

  async function getPayeeRules(payeeId) {
    return actualApi.getPayeeRules(payeeId);
  }

  async function createRule(rule) {
    return actualApi.createRule(rule);
  }

  async function updateRule(rule) {
    return actualApi.updateRule(rule);
  }

  async function deleteRule(ruleId) {
    return actualApi.deleteRule({ id: ruleId });
  }

  async function getSchedules() {
    return actualApi.getSchedules();
  }

  async function getSchedule(scheduleId) {
    const schedules = await getSchedules();
    return schedules.find((schedule) => scheduleId == schedule.id);
  }

  async function createSchedule(schedule) {
    return actualApi.createSchedule(schedule);
  }

  async function updateSchedule(scheduleId, schedule) {
    return actualApi.updateSchedule(scheduleId, schedule);
  }

  async function deleteSchedule(scheduleId) {
    return actualApi.deleteSchedule(scheduleId);
  }

  async function getBudgets() {
    return actualApi.getBudgets();
  }

  async function shutdown() {
    actualApi.shutdown();
  }

  function refreshSincIdToBudgetIdMap() {
    // Unfortunately Actual Node.js api doesn't provide functionality to get the
    // budget id associated to the sync id, this is a hack to do that
    const actualDataDir = getActualDataDir();
    try {
      const directories = listSubDirectories(actualDataDir);
      directories.forEach(subDir => {
        const metadata = JSON.parse(getFileContent(path.join(actualDataDir, subDir, 'metadata.json')));
        syncIdToBudgetId[metadata.groupId] = metadata.id;
      });
    } catch(err) {
      // The system will continue working normally,the only thing is that the budget will be downloaded
      // everytime the api is called
      console.error('Error creating map from sync id to budget id', err);
    }
  }

  async function exportData(budgetSyncId) {
    const dataDir = getActualDataDir();
    // Get the budget name safely
    const budget = (await getBudgets() || [])
      .find(b => b.groupId === budgetSyncId && !!b.id);
    if (!budget) {
      throw new Error(`Budget not found for budget sync id ${budgetSyncId}`);
    }
    // Create the archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    // Add files to the archive
    for (const file of ['db.sqlite', 'metadata.json']) {
      archive.file(path.join(dataDir, budget.id, file), { name: file });
    }
    // Return archive stream and filename
    return {
      fileName: `${new Date().toISOString().split('T')[0]}-${budget.name}.zip`,
      fileStream: archive
    };
  }

  async function runQuery(query) {
    return actualApi.runQuery(query);
  }

  return {
    q: actualApi.q,
    getMonths: getMonths,
    getMonth: getMonth,
    getMonthCategories: getMonthCategories,
    getMonthCategory: getMonthCategory,
    updateMonthCategory: updateMonthCategory,
    getMonthCategoryGroups: getMonthCategoryGroups,
    getMonthCategoryGroup: getMonthCategoryGroup,
    getAccounts: getAccounts,
    getAccount: getAccount,
    getAccountBalance: getAccountBalance,
    createAccount: createAccount,
    updateAccount: updateAccount,
    deleteAccount: deleteAccount,
    closeAccount: closeAccount,
    reopenAccount: reopenAccount,
    getTransactions: getTransactions,
    addTransaction: addTransaction,
    addTransactions: addTransactions,
    updateTransaction: updateTransaction,
    deleteTransaction: deleteTransaction,
    deleteTransactions: deleteTransactions,
    importTransactions: importTransactions,
    getCategories: getCategories,
    getCategory: getCategory,
    createCategory: createCategory,
    updateCategory: updateCategory,
    deleteCategory: deleteCategory,
    getCategoryGroups: getCategoryGroups,
    createCategoryGroup: createCategoryGroup,
    updateCategoryGroup: updateCategoryGroup,
    deleteCategoryGroup: deleteCategoryGroup,
    getPayees: getPayees,
    createPayee: createPayee,
    updatePayee: updatePayee,
    deletePayee: deletePayee,
    mergePayees: mergePayees,
    addCategoryTransfer: addCategoryTransfer,
    holdBudgetForNextMonth: holdBudgetForNextMonth,
    resetBudgetHold: resetBudgetHold,
    runBankSync: runBankSync,
    getRules: getRules,
    getPayeeRules: getPayeeRules,
    createRule: createRule,
    updateRule: updateRule,
    deleteRule: deleteRule,
    getSchedules: getSchedules,
    getSchedule: getSchedule,
    createSchedule: createSchedule,
    updateSchedule: updateSchedule,
    deleteSchedule: deleteSchedule,
    getBudgets: getBudgets,
    exportData: exportData,
    runQuery: runQuery,
    shutdown: shutdown,
  };
}

exports.Budget = Budget;