const { isEmpty } = require('../../utils/utils');

/**
 * @swagger
 * tags:
 *   - name: Budget Months
 *     description: Endpoints for managing the budget information for specific months. See [Budgets official documentation](https://actualbudget.org/docs/api/reference#budgets)
 * components:
 *   parameters:
 *     month:
 *       name: month
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Budget month
 *       example: 2023-08
 *     categoryId:
 *       name: categoryId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Category id
 *       example: 106963b3-ab82-4734-ad70-1d7dc2a52ff4
 *     categoryGroupId:
 *       name: categoryGroupId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Category group id
 *       example: d4394761-0427-4ad4-bde7-9a83e118541a
 *   schemas:
 *     BudgetMonth:
 *       required:
 *         - month
 *         - incomeAvailable
 *         - lastMonthOverspent
 *         - forNextMonth
 *         - totalBudgeted
 *         - toBudget
 *         - fromLastMonth
 *         - totalIncome
 *         - totalSpent
 *         - totalBalance
 *         - categoryGroups
 *       type: object
 *       properties:
 *         month:
 *           type: string
 *         incomeAvailable:
 *           type: integer
 *         lastMonthOverspent:
 *           type: integer
 *         forNextMonth:
 *           type: integer
 *         totalBudgeted:
 *           type: integer
 *         toBudget:
 *           type: integer
 *         fromLastMonth:
 *           type: integer
 *         totalIncome:
 *           type: integer
 *         totalSpent:
 *           type: integer
 *         totalBalance:
 *           type: integer
 *         categoryGroups:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BudgetMonthCategoryGroup'
 *     BudgetMonthCategoryGroup:
 *       required:
 *         - id
 *         - name
 *         - is_income
 *         - categories
 *         - budgeted
 *         - spent
 *         - balance
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *            type: integer
 *         is_income:
 *            type: boolean
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BudgetMonthCategory'
 *         budgeted:
 *           type: integer
 *         spent:
 *           type: integer
 *         balance:
 *           type: integer
 *     BudgetMonthCategory:
 *       required:
 *         - id
 *         - name
 *         - is_income
 *         - group_id
 *         - budgeted
 *         - spent
 *         - balance
 *         - carryover
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *            type: integer
 *         is_income:
 *            type: boolean
 *         group_id:
 *           type: string
 *         budgeted:
 *           type: integer
 *         spent:
 *           type: integer
 *         balance:
 *           type: integer
 *         carryover:
 *           type: boolean
 */

module.exports = (router) => {
  /**
   * @swagger
   * /budgets/{budgetSyncId}/months:
   *   get:
   *     summary: Returns list of months for the budget associated with the sync id specified
   *     tags: [Budget Months]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *     responses:
   *       '200':
   *         description: The list of months for the specified budget
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
   *                     type: string
   *                     description: Budget month
   *                     example: '2023-08'
   *               example:
   *                 data:
   *                   - 2023-05
   *                   - 2023-06
   *                   - 2023-07
   *                   - 2023-08
   *                   - 2023-09
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/months', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.getMonths()});
    } catch(err) {
      next(err);
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/months/{month}:
   *   get:
   *     summary: Returns the budget information for the month specified
   *     tags: [Budget Months]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/month'
   *     responses:
   *       '200':
   *         description: Budget month information
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/BudgetMonth'
   *               example:
   *                 data:
   *                   month: '2023-08'
   *                   incomeAvailable: 13041
   *                   lastMonthOverspent: 0
   *                   forNextMonth: 0
   *                   totalBudgeted: -13041
   *                   toBudget: 0
   *                   fromLastMonth: 1667
   *                   totalIncome: 11374
   *                   totalSpent: -661485
   *                   totalBalance: 1648273
   *                   categoryGroups:
   *                     - id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *                       name: 'Frequent'
   *                       is_income: false
   *                       budgeted: 287610
   *                       spent: -294337
   *                       balance: 3273
   *                       categories:
   *                         - id: '106963b3-ab82-4734-ad70-1d7dc2a52ff4'
   *                           name: 'For Spending'
   *                           is_income: false
   *                           group_id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *                           budgeted: 0
   *                           spent: 0
   *                           balance: 0
   *                           carryover: false
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/months/:month', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.getMonth(req.params.month)});
    } catch(err) {
      next(err);
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/months/{month}/categories:
   *   get:
   *     summary: Returns the list of categories for the month specified
   *     tags: [Budget Months]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/month'
   *     responses:
   *       '200':
   *         description: List of categories for the month specified
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
   *                     $ref: '#/components/schemas/BudgetMonthCategory'
   *               example:
   *                 data:
   *                   - id: '106963b3-ab82-4734-ad70-1d7dc2a52ff4'
   *                     name: 'For Spending'
   *                     is_income: false
   *                     group_id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *                     budgeted: 0
   *                     spent: 0
   *                     balance: 0
   *                     carryover: false
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/months/:month/categories', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.getMonthCategories(req.params.month)});
    } catch(err) {
      next(err);
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/months/{month}/categories/{categoryId}:
   *   get:
   *     summary: Returns the category information for the month specified
   *     tags: [Budget Months]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/month'
   *       - $ref: '#/components/parameters/categoryId'
   *     responses:
   *       '200':
   *         description: Category information for the month specified
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/BudgetMonthCategory'
   *               example:
   *                 data:
   *                   id: '106963b3-ab82-4734-ad70-1d7dc2a52ff4'
   *                   name: 'For Spending'
   *                   is_income: false
   *                   group_id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *                   budgeted: 0
   *                   spent: 0
   *                   balance: 0
   *                   carryover: false
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   patch:
   *     summary: Updates the category information for the month specified
   *     tags: [Budget Months]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/month'
   *       - $ref: '#/components/parameters/categoryId'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - category
   *             type: object
   *             properties:
   *               category:
   *                 type: object
   *                 properties:
   *                   budgeted:
   *                     type: integer
   *                   carryover:
   *                     type: boolean
   *             example:
   *               category:
   *                 budgeted: 1000
   *                 carryover: false
   *     responses:
   *       '200':
   *         description: Category information updated for the month specified
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               example:
   *                 message: Category updated
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/months/:month/categories/:categoryId', async (req, res, next) => {
    let desiredCategory;
    try {
      desiredCategory = await res.locals.budget.getMonthCategory(req.params.month, req.params.categoryId);
    } catch(err) {
      next(err);
      return;
    }
    if (desiredCategory) {
      res.json({'data': desiredCategory});
    } else {
      next(new Error('Category not found'));
    }
  });
  
  router.patch('/budgets/:budgetSyncId/months/:month/categories/:categoryId', async (req, res, next) => {
    const { month, categoryId } = req.params;
    try {
      let desiredCategory = await res.locals.budget.getMonthCategory(req.params.month, req.params.categoryId);
      if (!desiredCategory) {
        throw new Error('Category not found');
      }
      if (isEmpty(req.body.category)) {
          throw new Error('category information is required');
      }
      await res.locals.budget.updateMonthCategory(month, categoryId, req.body.category);
      res.json({'message': 'Category updated'});
    } catch(err) {
      next(err);
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/months/{month}/categorygroups:
   *   get:
   *     summary: Returns the list of category groups for the month specified
   *     tags: [Budget Months]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/month'
   *     responses:
   *       '200':
   *         description: List of category groups for the month specified
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
   *                     $ref: '#/components/schemas/BudgetMonthCategoryGroup'
   *               example:
   *                 data:
   *                   - id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *                     name: 'Frequent'
   *                     is_income: false
   *                     budgeted: 287610
   *                     spent: -294337
   *                     balance: 3273
   *                     categories:
   *                       - id: '106963b3-ab82-4734-ad70-1d7dc2a52ff4'
   *                         name: 'For Spending'
   *                         is_income: false
   *                         group_id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *                         budgeted: 0
   *                         spent: 0
   *                         balance: 0
   *                         carryover: false
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/months/:month/categorygroups', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.getMonthCategoryGroups(req.params.month)});
    } catch(err) {
      next(err);
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/months/{month}/categorygroups/{categoryGroupId}:
   *   get:
   *     summary: Returns the category group information for the month specified
   *     tags: [Budget Months]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/month'
   *       - $ref: '#/components/parameters/categoryGroupId'
   *     responses:
   *       '200':
   *         description: Category group information for the month specified
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/BudgetMonthCategoryGroup'
   *               example:
   *                 data:
   *                   id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *                   name: 'Frequent'
   *                   is_income: false
   *                   budgeted: 287610
   *                   spent: -294337
   *                   balance: 3273
   *                   categories:
   *                     - id: '106963b3-ab82-4734-ad70-1d7dc2a52ff4'
   *                       name: 'For Spending'
   *                       is_income: false
   *                       group_id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *                       budgeted: 0
   *                       spent: 0
   *                       balance: 0
   *                       carryover: false
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/months/:month/categorygroups/:categoryGroupId', async (req, res, next) => {
    let desiredCategoryGroup;
    try {
      desiredCategoryGroup = await res.locals.budget.getMonthCategoryGroup(req.params.month, req.params.categoryGroupId);
    } catch(err) {
      next(err);
      return;
    }
    if (desiredCategoryGroup) {
      res.json({'data': desiredCategoryGroup});
    } else {
      next(new Error('Category group not found'));
    }
  });
  
  /**
   * @swagger
   * /budgets/{budgetSyncId}/months/{month}/categorytransfers:
   *   post:
   *     summary: Creates a category transfer
   *     description: >-
   *       Moves money from one category to another for one specific month.<br>
   *       If the source category is not specified the money will come from available to budget.<br>
   *       If the destination is not specified the money will go to available to budget.
   *     tags: [Budget Months]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/month'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - categorytransfer
   *             type: object
   *             properties:
   *               categorytransfer:
   *                 type: object
   *                 properties:
   *                   fromCategoryId:
   *                     type: string
   *                   toCategoryId:
   *                     type: string
   *                   amount:
   *                     type: integer
   *             example:
   *               categorytransfer:
   *                 fromCategoryId: '106963b3-ab82-4734-ad70-1d7dc2a52ff4'
   *                 toCategoryId: '1affe7a5-a87a-45d2-9888-32225f8f5fd2'
   *                 amount: 10000
   *     responses:
   *       '200':
   *         description: Category transfer created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               example:
   *                 message: Category transfer created
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.post('/budgets/:budgetSyncId/months/:month/categorytransfers', async (req, res, next) => {
    try {
      if (isEmpty(req.body.categorytransfer)) {
          throw new Error('categorytransfer information is required');
      }
      await res.locals.budget.addCategoryTransfer(req.params.month, req.body.categorytransfer);
      res.json({'message': 'Category transfer created'});
    } catch(err) {
      next(err);
    }
  });
}