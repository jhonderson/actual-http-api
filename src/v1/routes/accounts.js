
const { isEmpty, formatDateToISOString, parseBoolean } = require('../../utils/utils');

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
 *     cutoffDate:
 *       name: cutoff_date
 *       in: query
 *       schema:
 *         type: string
 *       required: false
 *       description: Account balance cutoff date. Example 2023-08-01
 *     sinceDate:
 *       name: since_date
 *       in: query
 *       schema:
 *         type: string
 *       required: true
 *       description: Starting date. Example 2023-08-01
 *     untilDate:
 *       name: until_date
 *       in: query
 *       schema:
 *         type: string
 *       required: false
 *       description: End date. Example 2023-08-31
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
  *         clearedBalance:
  *           type: integer
  *           description: Cleared balance (only included when include_balances=true)
  *         unclearedBalance:
  *           type: integer
  *           description: Uncleared balance (only included when include_balances=true)
  *         workingBalance:
  *           type: integer
  *           description: Working balance (cleared + uncleared, only included when include_balances=true)
  *     Amount:
  *       type: integer
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
   *       - name: include_balances
   *         in: query
   *         schema:
   *           type: boolean
   *         required: false
   *         description: When true, includes account balances (cleared, uncleared, working) in the response
   *       - name: exclude_offbudget
   *         in: query
   *         schema:
   *           type: boolean
   *         required: false
   *         description: When true, off-budget accounts are excluded
   *       - name: exclude_closed
   *         in: query
   *         schema:
   *           type: boolean
   *         required: false
   *         description: When true, closed accounts are excluded (only used when include_balances is true)
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
    *                 - data:
    *                   - id: '671b669d-b616-4bf1-8a04-c82d73f87d5b'
    *                     name: 'Checking'
    *                     offbudget: false
    *                     closed: false
    *                     clearedBalance: 12000
    *                     unclearedBalance: -500
    *                     workingBalance: 11500
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/accounts', async (req, res, next) => {
    try {
      const includeBalances = parseBoolean(req.query.include_balances);
      const excludeOffbudget = parseBoolean(req.query.exclude_offbudget);
      const excludeClosed = parseBoolean(req.query.exclude_closed);

      res.json({ data: await res.locals.budget.getAccounts({ 
        includeBalances, 
        excludeOffbudget, 
        excludeClosed 
      }) });
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
   * /budgets/{budgetSyncId}/accounts/{accountId}/balance:                                                                                                                                                                                  
   *   get:                                                                                                                                                                                                                                 
   *     summary: Gets the balance for an account. If a cutoff is given, it gives the account balance as of that date. If no cutoff is given, it uses the current date as the cutoff.
   *     tags: [Accounts]                                                                                                                                                                                                                   
   *     security:                                                                                                                                                                                                                          
   *       - apiKey: []                                                                                                                                                                                                                     
   *     parameters:                                                                                                                                                                                                                        
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountId'
   *       - $ref: '#/components/parameters/cutoffDate'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:                                                                                                                                                                                                                         
   *       '200':                                                                                                                                                                                                                           
   *         description: Account balance                                                                                                                                                                                                   
   *         content:                                                                                                                                                                                                                       
   *           application/json:                                                                                                                                                                                                            
   *             schema:                                                                                                                                                                                                                    
   *               required:                                                                                                                                                                                                                
   *                 - data                                                                                                                                                                                                                 
   *               type: object                                                                                                                                                                                                             
   *               properties:                                                                                                                                                                                                              
   *                 data:                                                                                                                                                                                                                  
   *                   $ref: '#/components/schemas/Amount'                                                                                                                                                                                  
   *               examples:                                                                                                                                                                                                                
   *                 - data: 2000                                                                                                                                                                                                           
   *       '404':                                                                                                                                                                                                                           
   *         $ref: '#/components/responses/404'                                                                                                                                                                                             
   *       '500':                                                                                                                                                                                                                           
   *         $ref: '#/components/responses/500'                                                                                                                                                                                             
   */                                                                                                                                                                                                                                       
  router.get('/budgets/:budgetSyncId/accounts/:accountId/balance', async (req, res, next) => {
    try {
      const balance = await res.locals.budget.getAccountBalance(req.params.accountId, req.query.cutoff_date);                                                                                                                                                      
      if (balance !== undefined) {           
        // Removing any additional field in the balance response                                                                                                                                                                                                             
        res.json({ data: balance || 0 });
      } else {
        throw new Error('Account not found');
      }
    } catch(err) {
      next(err);
    }
  });

  /**                                                                                                                                                                                                                                       
   * @swagger                                                                                                                                                                                                                               
   * /budgets/{budgetSyncId}/accounts/{accountId}/balancehistory:                                                                                                                                                                                  
   *   get:                                                                                                                                                                                                                                 
   *     summary: Gets the balance history for an account, from start to end date, with daily granularity. Until date is optional, defaults to today.
   *     tags: [Accounts]
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
   *         description: Account balance                                                                                                                                                                                                   
   *         content:                                                                                                                                                                                                                       
   *           application/json:                                                                                                                                                                                                            
   *             schema:                                                                                                                                                                                                                    
   *               required:                                                                                                                                                                                                                
   *                 - data                                                                                                                                                                                                                 
   *               type: object                                                                                                                                                                                                             
   *               properties:                                                                                                                                                                                                              
   *                 data:                                                                                                                                                                                                                  
   *                   $ref: '#/components/schemas/Amount'                                                                                                                                                                                  
   *               examples:                                                                                                                                                                                                                
   *                 - data: 2000                                                                                                                                                                                                           
   *       '404':                                                                                                                                                                                                                           
   *         $ref: '#/components/responses/404'                                                                                                                                                                                             
   *       '500':                                                                                                                                                                                                                           
   *         $ref: '#/components/responses/500'                                                                                                                                                                                             
   */                                                                                                                                                                                                                                       
  router.get('/budgets/:budgetSyncId/accounts/:accountId/balancehistory', async (req, res, next) => {
    try {
      const { since_date: sinceDate, until_date: untilDate } = req.query;
      if (!sinceDate) {
        throw new Error('since_date query parameter is required');
      }
      const start = new Date(sinceDate);
      const end = untilDate ? new Date(untilDate) : new Date();
      if (isNaN(start) || isNaN(end) || start > end) {
        throw new Error('Invalid date range');
      }
      const dailyBalance = {};
      let current = new Date(start);
      while (current <= end) {
        const currentDate = formatDateToISOString(current);
        dailyBalance[currentDate] =
          (await res.locals.budget.getAccountBalance(req.params.accountId, currentDate)) || 0;
        current.setDate(current.getDate() + 1);
      }
      res.json({ data: dailyBalance });
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

  /**
   * @swagger
   * /budgets/{budgetSyncId}/accounts/{accountId}/banksync:
   *   post:
   *     summary: Triggers a bank sync for a specific account
   *     tags: [Accounts]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Bank sync started
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Bank sync started
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.post('/budgets/:budgetSyncId/accounts/:accountId/banksync', async (req, res, next) => {
    try {
      await res.locals.budget.runBankSync(req.params.accountId);
      res.json({ message: 'Bank sync started' });
    } catch(err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/accounts/banksync:
   *   post:
   *     summary: Triggers a bank sync
   *     tags: [Accounts]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Bank sync started
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Bank sync started
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.post('/budgets/:budgetSyncId/accounts/banksync', async (req, res, next) => {
    try {
      await res.locals.budget.runBankSync();
      res.json({ message: 'Bank sync started' });    
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