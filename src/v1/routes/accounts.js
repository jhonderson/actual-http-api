
const { isEmpty } = require('../../utils/utils');

/**
 * @swagger
 * tags:
 *   - name: Accounts
 *     description: Endpoints for managing accounts. See [Accounts official documentation](https://actualbudget.org/docs/api/reference#accounts)
 * components:
 *   parameters:
 *     accountId:
 *       name: accountId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Account id
 *   schemas:
 *     Account:
 *       required:
 *         - id
 *         - name
 *         - offbudget
 *         - closed
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         offbudget:
 *           type: boolean
 *         closed:
 *           type: boolean
 */

module.exports = (router) => {
  /**
   * @swagger
   * /budgets/{budgetSyncId}/accounts:
   *   get:
   *     summary: Returns list of accounts for the budget associated with the sync id specified
   *     tags: [Accounts]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The list of accounts for the specified budget
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
   *                     $ref: '#/components/schemas/Account'
   *               examples:
   *                 - data:
   *                   - id: '671b669d-b616-4bf1-8a04-c82d73f87d5b'
   *                     name: 'Checking'
   *                     offbudget: false
   *                     closed: false
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/accounts', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.getAccounts()});
    } catch(err) {
      next(err);
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/accounts/{accountId}:
   *   get:
   *     summary: Returns account information
   *     tags: [Accounts]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Account information
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Account'
   *               examples:
   *                 - data:
   *                     id: '671b669d-b616-4bf1-8a04-c82d73f87d5b'
   *                     name: 'Checking'
   *                     offbudget: false
   *                     closed: false
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/accounts/:accountId', async (req, res, next) => {
    try {
      const account = await res.locals.budget.getAccount(req.params.accountId);
      if (account) {
        res.json({'data': account});
      } else {
        throw new Error('Account not found');
      }
    } catch(err) {
      next(err);
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/accounts:
   *   post:
   *     summary: Creates an account
   *     tags: [Accounts]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - account
   *             type: object
   *             properties:
   *               account:
   *                 required:
   *                   - name
   *                   - offbudget
   *                 type: object
   *                 properties:
   *                   name:
   *                      type: string
   *                   offbudget:
   *                      type: boolean
   *             examples:
   *               - account:
   *                   name: 'Checking'
   *                   offbudget: false
   *     responses:
   *       '200':
   *         description: Account created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Account created
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.post('/budgets/:budgetSyncId/accounts', async (req, res, next) => {
    try {
      validateAccountBody(req.body.account);
      res.json({'data': await res.locals.budget.createAccount(req.body.account)});
    } catch(err) {
      next(err);
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/accounts/{accountId}:
   *   patch:
   *     summary: Updates an account
   *     tags: [Accounts]
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
   *               - account
   *             type: object
   *             properties:
   *               account:
   *                 required:
   *                   - name
   *                   - offbudget
   *                 type: object
   *                 properties:
   *                   id:
   *                      type: string
   *                   name:
   *                      type: string
   *                   offbudget:
   *                      type: boolean
   *             examples:
   *               - account:
   *                   name: 'Checking new name'
   *     responses:
   *       '200':
   *         description: Account updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Account updated
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   delete:
   *     summary: Deletes an account
   *     tags: [Accounts]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Account deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Account deleted
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.patch('/budgets/:budgetSyncId/accounts/:accountId', async (req, res, next) => {
    try {
      await validateAccountExists(res, req.params.accountId);
      validateAccountBody(req.body.account);
      await res.locals.budget.updateAccount(req.params.accountId, req.body.account);
      res.json({'message': 'Account updated'});
    } catch(err) {
      next(err);
    }
  });
  
  router.delete('/budgets/:budgetSyncId/accounts/:accountId', async (req, res, next) => {
    try {
      await validateAccountExists(res, req.params.accountId);
      await res.locals.budget.deleteAccount(req.params.accountId);
      res.json({'message': 'Account deleted'});
    } catch(err) {
      next(err);
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/accounts/{accountId}/close:
   *   put:
   *     summary: Closes an account
   *     description: >-
   *       transferAccountId and transferCategoryId are optional if the balance of the account is 0,
   *       otherwise if the account has a non-zero balance, you need to specify an account with
   *       transferAccountId to transfer the money into.<br>If you are transferring from an on-budget
   *       account to an off-budget account, you can optionally specify a category with transferCategoryId
   *       to categorize the transfer transaction.
   *     tags: [Accounts]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               transfer:
   *                 type: object
   *                 properties:
   *                   transferAccountId:
   *                      type: string
   *                   transferCategoryId:
   *                      type: string
   *             examples:
   *               - transfer:
   *                   transferAccountId: '671b669d-b616-4bf1-8a04-c82d73f87d5b'
   *                   transferCategoryId: '3c1699a5-522a-435e-86dc-93d900a14f0e'
   *     responses:
   *       '200':
   *         description: Account closed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Account closed
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.put('/budgets/:budgetSyncId/accounts/:accountId/close', async (req, res, next) => {
    try {
      await validateAccountExists(res, req.params.accountId);
      await res.locals.budget.closeAccount(req.params.accountId, req.body?.transfer || {});
      res.json({'message': 'Account closed'});
    } catch(err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/accounts/{accountId}/reopen:
   *   put:
   *     summary: Reopens a closed account
   *     tags: [Accounts]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Account reopened
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Account reopened
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.put('/budgets/:budgetSyncId/accounts/:accountId/reopen', async (req, res, next) => {
    try {
      // We can't validate if accounts exists since the get account by id won't return closed accounts
      await res.locals.budget.reopenAccount(req.params.accountId);
      res.json({'message': 'Account reopened'});
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

  function validateAccountBody(account) {
    if (isEmpty(account)) {
      throw new Error('account information is required');
    }
  }
}