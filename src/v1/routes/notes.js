/**
 * @swagger
 * tags:
 *   - name: Notes
 *     description: Endpoints for retrieving notes
 * components:
 *   parameters:
 *     categoryId:
 *       name: categoryId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Category id
 *     accountId:
 *       name: accountId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Account id
 *     budgetMonth:
 *       name: budgetMonth
 *       in: path
 *       schema:
 *         type: string
 *         example: "2026-03"
 *       required: true
 *       description: Budget month in YYYY-MM format
 */

module.exports = (router) => {

  /**
   * @swagger
   * /budgets/{budgetSyncId}/notes/category/{categoryId}:
   *   get:
   *     summary: Returns notes for a category
   *     tags: [Notes]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/categoryId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Category notes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required:
   *                 - data
   *               properties:
   *                 data:
   *                   type: string
   *                   nullable: true
   *               examples:
   *                 - data: "This is a note for this category"
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/notes/category/:categoryId', async (req, res, next) => {
    try {
      const notes = await res.locals.budget.getCategoryNotes(req.params.categoryId);
      res.json({ data: notes ?? "" });
    } catch (err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/notes/account/{accountId}:
   *   get:
   *     summary: Returns notes for an account
   *     tags: [Notes]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Account notes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required:
   *                 - data
   *               properties:
   *                 data:
   *                   type: string
   *                   nullable: true
   *               examples:
   *                 - data: "Account notes"
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/notes/account/:accountId', async (req, res, next) => {
    try {
      const notes = await res.locals.budget.getAccountNotes(req.params.accountId);
      res.json({ data: notes ?? "" });
    } catch (err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/notes/budgetmonth/{budgetMonth}:
   *   get:
   *     summary: Returns notes for a budget month
   *     tags: [Notes]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetMonth'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Budget month notes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required:
   *                 - data
   *               properties:
   *                 data:
   *                   type: string
   *                   nullable: true
   *               examples:
   *                 - data: "Notes for March"
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/notes/budgetmonth/:budgetMonth', async (req, res, next) => {
    try {
      const notes = await res.locals.budget.getBudgetMonthNotes(req.params.budgetMonth);
      res.json({ data: notes ?? "" });
    } catch (err) {
      next(err);
    }
  });
};