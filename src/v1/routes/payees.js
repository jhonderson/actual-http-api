
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
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
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
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
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
   *                   name: 'Fidelity'
   *     responses:
   *       '200':
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
   *   get:
   *     summary: Returns a payee
   *     tags: [Payees]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/payeeId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Payee
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Payee'
   *               examples:
   *                 - data:
   *                     id: '9de084a4-dc96-4015-ac81-ba57ee340acd'
   *                     name: 'Fidelity'
   *                     category: null
   *                     transfer_acct: '729cb492-4eab-468b-9522-75d455cded22'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   patch:
   *     summary: Updates a payee
   *     tags: [Payees]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/payeeId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
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
   *                   name: 'Fidelity'
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
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
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
  router.get('/budgets/:budgetSyncId/payees/:payeeId', async (req, res, next) => {
    try {
      const allPayees = await res.locals.budget.getPayees() || [];
      const queriedPayee = allPayees.find(payee => payee.id === req.params.payeeId);
      if (!queriedPayee) {
        throw new Error(`Payee with id '${req.params.payeeId}' not found`);
      }
      res.json({'data': queriedPayee});
    } catch(err) {
      next(err);
    }
  });

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

  /**
   * @swagger
   * /budgets/{budgetSyncId}/payees/{payeeId}/rules:
   *   get:
   *     summary: Returns list of rules for a payee
   *     tags: [Payees]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/payeeId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The list of rules for a payee
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
   *                     $ref: '#/components/schemas/Rule'
   *               examples:
   *                 - data:
   *                   - id: '3ac44ad6-339a-459f-8eb6-fcff4cb87c34'
   *                     stage: 'pre'
   *                     conditionsOp: 'and'
   *                     conditions:
   *                       - op: 'is'
   *                         field: 'payee'
   *                         value: '6740d5c1-5a89-4fa0-a35c-910e6da86e8r'
   *                         type: 'id'
   *                     actions:
   *                       - op: 'set'
   *                         field: 'category'
   *                         value: '9787f2b1-d145-4afc-95b5-8f39ac68f8h5'
   *                         type: 'id'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/payees/:payeeId/rules', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.getPayeeRules(req.params.payeeId)});
    } catch(err) {
      next(err);
    }
  });
}