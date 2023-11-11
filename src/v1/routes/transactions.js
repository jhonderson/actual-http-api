const { isEmpty } = require('../../utils/utils');

/**
 * @swagger
 * tags:
 *   - name: Transactions
 *     description: Endpoints for managing transactions. See [Transactions official documentation](https://actualbudget.org/docs/api/reference#transactions)
 * components:
 *   parameters:
 *     transactionId:
 *       name: transactionId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Transaction id
 *       example: 671b669d-b616-4bf1-8a04-c82d73f87d5b
 *     sinceDate:
 *       name: since_date
 *       in: query
 *       schema:
 *         type: string
 *       required: true
 *       description: Starting date
 *       example: 2023-08-01
 *     untilDate:
 *       name: until_date
 *       in: query
 *       schema:
 *         type: string
 *       required: false
 *       description: End date
 *       example: 2023-08-31
 *   schemas:
 *     Transaction:
 *       required:
 *         - account
 *         - date
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         account:
 *           type: string
 *         date:
 *           type: string
 *         amount:
 *           type: integer
 *         payee:
 *           type: string
 *         payee_name:
 *           type: string
 *           description: 'Only available in a create request'
 *         imported_payee:
 *           type: string
 *         category:
 *           type: string
 *         notes:
 *           type: string
 *         imported_id:
 *           type: string
 *         transfer_id:
 *           type: string
 *         cleared:
 *           type: string
 *         subtransactions:
 *           type: array
 *           description: 'Only available in a get or create request'
 *           items:
 *             $ref: '#/components/schemas/Transaction'
 */

module.exports = (router) => {
  /**
   * @swagger
   * /budgets/{budgetSyncId}/accounts/{accountId}/transactions:
   *   get:
   *     summary: Returns list of transactions for an account
   *     tags: [Transactions]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountId'
   *       - $ref: '#/components/parameters/sinceDate'
   *       - $ref: '#/components/parameters/untilDate'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The list of transactions for an account
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Transaction'
   *               examples:
   *                 - data:
   *                   - id: "4d194727-2ab2-4b50-a1aa-d506f2790e68"
   *                     is_parent: false
   *                     is_child: false
   *                     parent_id: null
   *                     account: "729cb492-4eab-468b-9522-75d455cded22"
   *                     category: "9fa2550c-c3ff-498b-8df6-e0fbe2a62e0e"
   *                     amount: -7374
   *                     payee: "c5647552-a5b1-4fea-a2bd-4aa2e4d03938"
   *                     notes: null
   *                     date: "2023-06-23"
   *                     imported_id: null
   *                     error: null
   *                     imported_payee: "Remitly"
   *                     starting_balance_flag: false
   *                     transfer_id: null
   *                     sort_order: 1693171043936
   *                     cleared: true
   *                     tombstone: false
   *                     schedule: null
   *                     subtransactions: []
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   post:
   *     summary: Creates a transaction
   *     description: >-
   *       Actual Budget api says the addTransactions functionality returns a list of ids for
   *       the transactions created, but that is not the case, it simply returns the string message 'ok'
   *     tags: [Transactions]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - transaction
   *             type: object
   *             properties:
   *               transaction:
   *                 $ref: '#/components/schemas/Transaction'
   *             examples:
   *               - transaction:
   *                 account: "729cb492-4eab-468b-9522-75d455cded22"
   *                 category: "9fa2550c-c3ff-498b-8df6-e0fbe2a62e0e"
   *                 amount: -7374
   *                 payee_name: "Remitly"
   *                 date: "2023-06-23"
   *                 cleared: false
   *     responses:
   *       '200':
   *         description: ok
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: ok
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/accounts/:accountId/transactions', async (req, res, next) => {
    try {
      if (!req.query.since_date) {
        throw new Error('since_date query parameter is required');
      }
      await validateAccountExists(res, req.params.accountId);
      res.json({'data': await res.locals.budget.getTransactions(req.params.accountId, req.query.since_date,
        req.query.until_date)});
    } catch(err) {
      next(err);
    }
  });
  
  router.post('/budgets/:budgetSyncId/accounts/:accountId/transactions', async (req, res, next) => {
    try {
      validateTransactionBody(req.body.transaction);
      await validateAccountExists(res, req.params.accountId);
      res.json({'message': await res.locals.budget.addTransaction(req.params.accountId, req.body.transaction)}).status(201);
    } catch(err) {
      next(err);
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/accounts/{accountId}/transactions/batch:
   *   post:
   *     summary: Creates a list of transactions
   *     description: >-
   *       Actual Budget api says the addTransactions functionality returns a list of ids for
   *       the transactions created, but that is not the case, it simply returns the string message 'ok'
   *     tags: [Transactions]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - transactions
   *             type: object
   *             properties:
   *               transactions:
   *                 type: array
   *                 items:
   *                   $ref: '#/components/schemas/Transaction'
   *             examples:
   *               - transactions:
   *                 - account: "729cb492-4eab-468b-9522-75d455cded22"
   *                   category: "9fa2550c-c3ff-498b-8df6-e0fbe2a62e0e"
   *                   amount: -7374
   *                   payee_name: "Remitly"
   *                   date: "2023-06-23"
   *                   cleared: false
   *     responses:
   *       '200':
   *         description: ok
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: ok
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.post('/budgets/:budgetSyncId/accounts/:accountId/transactions/batch', async (req, res, next) => {
    try {
      validateTransactionsArray(req.body.transactions);
      await validateAccountExists(res, req.params.accountId);
      res.json({'message': await res.locals.budget.addTransactions(req.params.accountId, req.body.transactions)}).status(201);
    } catch(err) {
      next(err);
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/accounts/{accountId}/transactions/import:
   *   post:
   *     summary: Imports a list of transactions
   *     tags: [Transactions]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - transactions
   *             type: object
   *             properties:
   *               transactions:
   *                 type: array
   *                 items:
   *                   $ref: '#/components/schemas/Transaction'
   *             examples:
   *               - transactions:
   *                 - account: "729cb492-4eab-468b-9522-75d455cded22"
   *                   category: "9fa2550c-c3ff-498b-8df6-e0fbe2a62e0e"
   *                   amount: -7374
   *                   payee_name: "Remitly"
   *                   date: "2023-06-23"
   *                   cleared: false
   *     responses:
   *       '201':
   *         description: Ids of transactions add and updated
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   required:
   *                     - added
   *                     - updated
   *                   type: object
   *                   properties:
   *                     added:
   *                        type: array
   *                        items:
   *                          type: string
   *                          description: Id of transaction added
   *                          examples:
   *                            - '1a152a80-af05-4efa-ba4a-95f814a9d1d1'
   *                     updated:
   *                        type: array
   *                        items:
   *                          type: string
   *                          description: Id of transaction updated
   *                          examples:
   *                            - '1fbd4467-004d-4163-8569-6f83f8db6eca'
   *               examples:
   *                 - data:
   *                   added:
   *                     - "1a152a80-af05-4efa-ba4a-95f814a9d1d1"
   *                     - "f64fd861-ba21-481b-ac88-2c30c6660240"
   *                   updated:
   *                     - "1fbd4467-004d-4163-8569-6f83f8db6eca"
   *                     - "34339ba3-7b38-4b3a-b90d-4a895781ea9e"
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.post('/budgets/:budgetSyncId/accounts/:accountId/transactions/import', async (req, res, next) => {
    try {
      validateTransactionsArray(req.body.transactions);
      await validateAccountExists(res, req.params.accountId);
      res.json({'data': await res.locals.budget.importTransactions(req.params.accountId, req.body.transactions)}).status(201);
    } catch(err) {
      next(err);
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/transactions/{transactionId}:
   *   patch:
   *     summary: Updates a transaction
   *     tags: [Transactions]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/transactionId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - transaction
   *             type: object
   *             properties:
   *               transaction:
   *                 required:
   *                   - account
   *                   - date
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                   account:
   *                     type: string
   *                   date:
   *                     type: string
   *                   amount:
   *                     type: integer
   *                   payee:
   *                     type: string
   *                   imported_payee:
   *                     type: string
   *                   category:
   *                     type: string
   *                   notes:
   *                     type: string
   *                   imported_id:
   *                     type: string
   *                   transfer_id:
   *                     type: string
   *                   cleared:
   *                     type: string
   *             examples:
   *               - transaction:
   *                 account: "729cb492-4eab-468b-9522-75d455cded22"
   *                 category: "9fa2550c-c3ff-498b-8df6-e0fbe2a62e0e"
   *                 amount: -7374
   *                 date: "2023-06-23"
   *                 cleared: true
   *     responses:
   *       '200':
   *         description: Transaction updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Transaction updated
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   delete:
   *     summary: Deletes a transaction
   *     tags: [Transactions]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/transactionId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Transaction deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Transaction deleted
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.patch('/budgets/:budgetSyncId/transactions/:transactionId', async (req, res, next) => {
    try {
      validateTransactionBody(req.body.transaction);
      await res.locals.budget.updateTransaction(req.params.transactionId, req.body.transaction);
      res.json({'message': 'Transaction updated'});
    } catch(err) {
      next(err);
    }
  });

  router.delete('/budgets/:budgetSyncId/transactions/:transactionId', async (req, res, next) => {
    try {
      await res.locals.budget.deleteTransaction(req.params.transactionId);
      res.json({'message': 'Transaction deleted'});
    } catch(err) {
      next(err);
    }
  });

  async function validateAccountExists(res, accountId) {
    const account = await res.locals.budget.getAccount(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
  }

  function validateTransactionBody(transaction) {
    if (isEmpty(transaction)) {
      throw new Error('transaction information is required');
    }
  }

  function validateTransactionsArray(transactions) {
    if (transactions === undefined || !transactions.length) {
      throw new Error('List of transactions is required');
    }
  }
}