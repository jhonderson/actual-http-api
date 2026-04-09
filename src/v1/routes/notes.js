/**
 * @swagger
 * tags:
 *   - name: Notes
 *     description: Endpoints for retrieving and modifying notes
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
   * /budgets/{budgetSyncId}/notes/category/{categoryId}:
   *   put:
   *     summary: Sets (creates or replaces) notes for a category
   *     tags: [Notes]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/categoryId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - data
   *             properties:
   *               data:
   *                 type: string
   *             examples:
   *               - data: "This is a note for this category"
   *     responses:
   *       '200':
   *         description: Category notes updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Category notes updated
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   delete:
   *     summary: Deletes notes for a category
   *     tags: [Notes]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/categoryId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Category notes deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Category notes deleted
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.put('/budgets/:budgetSyncId/notes/category/:categoryId', async (req, res, next) => {
    try {
      if (typeof req.body?.data !== 'string') {
        throw new Error('Request body must include a "data" string field');
      }
      await res.locals.budget.setCategoryNotes(req.params.categoryId, req.body.data);
      res.json({ message: 'Category notes updated' });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/budgets/:budgetSyncId/notes/category/:categoryId', async (req, res, next) => {
    try {
      await res.locals.budget.setCategoryNotes(req.params.categoryId, null);
      res.json({ message: 'Category notes deleted' });
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
   * /budgets/{budgetSyncId}/notes/account/{accountId}:
   *   put:
   *     summary: Sets (creates or replaces) notes for an account
   *     tags: [Notes]
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
   *             type: object
   *             required:
   *               - data
   *             properties:
   *               data:
   *                 type: string
   *             examples:
   *               - data: "Account notes"
   *     responses:
   *       '200':
   *         description: Account notes updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Account notes updated
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   delete:
   *     summary: Deletes notes for an account
   *     tags: [Notes]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Account notes deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Account notes deleted
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.put('/budgets/:budgetSyncId/notes/account/:accountId', async (req, res, next) => {
    try {
      if (typeof req.body?.data !== 'string') {
        throw new Error('Request body must include a "data" string field');
      }
      await res.locals.budget.setAccountNotes(req.params.accountId, req.body.data);
      res.json({ message: 'Account notes updated' });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/budgets/:budgetSyncId/notes/account/:accountId', async (req, res, next) => {
    try {
      await res.locals.budget.setAccountNotes(req.params.accountId, null);
      res.json({ message: 'Account notes deleted' });
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

  /**
   * @swagger
   * /budgets/{budgetSyncId}/notes/budgetmonth/{budgetMonth}:
   *   put:
   *     summary: Sets (creates or replaces) notes for a budget month
   *     tags: [Notes]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetMonth'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - data
   *             properties:
   *               data:
   *                 type: string
   *             examples:
   *               - data: "Notes for March"
   *     responses:
   *       '200':
   *         description: Budget month notes updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Budget month notes updated
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   delete:
   *     summary: Deletes notes for a budget month
   *     tags: [Notes]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetMonth'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Budget month notes deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Budget month notes deleted
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.put('/budgets/:budgetSyncId/notes/budgetmonth/:budgetMonth', async (req, res, next) => {
    try {
      if (typeof req.body?.data !== 'string') {
        throw new Error('Request body must include a "data" string field');
      }
      await res.locals.budget.setBudgetMonthNotes(req.params.budgetMonth, req.body.data);
      res.json({ message: 'Budget month notes updated' });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/budgets/:budgetSyncId/notes/budgetmonth/:budgetMonth', async (req, res, next) => {
    try {
      await res.locals.budget.setBudgetMonthNotes(req.params.budgetMonth, null);
      res.json({ message: 'Budget month notes deleted' });
    } catch (err) {
      next(err);
    }
  });
};