
/**
 * @swagger
 * tags:
 *   - name: Payees
 *     description: Endpoints for managing payees. See [Payees official documentation](https://actualbudget.org/docs/api/reference#payees)
 * components:
 *   parameters:
 *     payeeId:
 *       name: payeeId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Payee id
 *       example: '5bd3f624-53c1-4901-bfb7-4f01ee217983'
 *   schemas:
 *     Payee:
 *       required:
 *         - name
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         transfer_acct:
 *           type: string
 */

module.exports = (router) => {
  /**
   * @swagger
   * /budgets/{budgetSyncId}/payees:
   *   get:
   *     summary: Returns list of payees
   *     tags: [Payees]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *     responses:
   *       '200':
   *         description: The list of payees
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
   *                     $ref: '#/components/schemas/Payee'
   *               examples:
   *                 - data:
   *                   - id: 'f733399d-4ccb-4758-b208-7422b27f650a'
   *                     name: 'Fidelity'
   *                     category: null
   *                     transfer_acct: '729cb492-4eab-468b-9522-75d455cded22'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   post:
   *     summary: Creates a payee
   *     tags: [Payees]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - payee
   *             type: object
   *             properties:
   *               payee:
   *                 $ref: '#/components/schemas/Payee'
   *             examples:
   *               - payee:
   *                 name: 'Fidelity'
   *     responses:
   *       '201':
   *         description: Payee id
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   type: string
   *                   description: Payee id
   *               examples:
   *                 - data: 'f733399d-4ccb-4758-b208-7422b27f650a'
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/payees', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.getPayees()});
    } catch(err) {
      next(err);
    }
  });
  
  router.post('/budgets/:budgetSyncId/payees', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.createPayee(req.body.payee)});
    } catch(err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/payees/{payeeId}:
   *   patch:
   *     summary: Updates a payee
   *     tags: [Payees]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/payeeId'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - payee
   *             type: object
   *             properties:
   *               payee:
   *                 $ref: '#/components/schemas/Payee'
   *             examples:
   *               - payee:
   *                 name: 'Fidelity'
   *     responses:
   *       '200':
   *         description: Payee updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Payee updated
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   delete:
   *     summary: Deletes a payee
   *     tags: [Payees]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/payeeId'
   *     responses:
   *       '200':
   *         description: Payee deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Payee deleted
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.patch('/budgets/:budgetSyncId/payees/:payeeId', async (req, res, next) => {
    try {
      await res.locals.budget.updatePayee(req.params.payeeId, req.body.payee);
      res.json({'message': 'Payee updated'});
    } catch(err) {
      next(err);
    }
  });
  
  router.delete('/budgets/:budgetSyncId/payees/:payeeId', async (req, res, next) => {
    try {
      await res.locals.budget.deletePayee(req.params.payeeId);
      res.json({'message': 'Payee deleted'});
    } catch(err) {
      next(err);
    }
  });
}