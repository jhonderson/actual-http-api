/**
 * @swagger
 * tags:
 *   - name: Rules
 *     description: Endpoints for managing rules. See [Rules official documentation](https://actualbudget.org/docs/api/reference#rules)
 * components:
 *   parameters:
 *     ruleId:
 *       name: ruleId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Rule id
 *   schemas:
 *     ConditionOrAction:
 *       required:
 *         - field
 *         - op
 *         - value
 *       type: object
 *       properties:
 *         field:
 *           type: string
 *         op:
 *           type: string
 *         value:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *           type: string
 *         type:
 *           type: string
 *     Rule:
 *       required:
 *         - stage
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         stage:
 *           type: string
 *           description: 'Must be one of "pre", "default", or "post"'
 *         conditionsOp:
 *           type: string
 *           description: 'Must be one of "and" or "or"'
 *         conditions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ConditionOrAction'
 *             description: 'Array of conditions'
 *         actions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ConditionOrAction'
 *             description: 'Array of actions'
 */

module.exports = (router) => {
  /**
   * @swagger
   * /budgets/{budgetSyncId}/rules:
   *   get:
   *     summary: Returns list of rules for the budget associated with the sync id specified
   *     tags: [Rules]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The list of rules for the specified budget
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
   *   post:
   *     summary: Creates a rule
   *     tags: [Rules]
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
   *               - rule
   *             type: object
   *             properties:
   *               rule:
   *                 required:
   *                   - stage
   *                 type: object
   *                 properties:
   *                   stage:
   *                     type: string
   *                     description: 'Must be one of "pre", "default", or "post"'
   *                   conditionsOp:
   *                     type: string
   *                     description: 'Must be one of "and" or "or"'
   *                   conditions:
   *                     type: array
   *                     items:
   *                       $ref: '#/components/schemas/ConditionOrAction'
   *                       description: 'Array of conditions'
   *                   actions:
   *                     type: array
   *                     items:
   *                       $ref: '#/components/schemas/ConditionOrAction'
   *                       description: 'Array of actions'
   *             examples:
   *               - rule:
   *                   stage: 'pre'
   *                   conditionsOp: 'and'
   *                   conditions:
   *                     - op: 'is'
   *                       field: 'payee'
   *                       value: '6740d5c1-5a89-4fa0-a35c-910e6da86e8r'
   *                       type: 'id'
   *                   actions:
   *                     - op: 'set'
   *                       field: 'category'
   *                       value: '9787f2b1-d145-4afc-95b5-8f39ac68f8h5'
   *                       type: 'id'
   *     responses:
   *       '200':
   *         description: Rule created
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Rule'
   *               examples:
   *                 - data:
   *                     id: '3ac44ad6-339a-459f-8eb6-fcff4cb87c34'
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
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/rules', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.getRules()});
    } catch(err) {
      next(err);
    }
  });

  router.post('/budgets/:budgetSyncId/rules', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.createRule(req.body.rule)});
    } catch(err) {
      next(err);
    }
  });


  /**
   * @swagger
   * /budgets/{budgetSyncId}/rules/{ruleId}:
   *   get:
   *     summary: Returns a rule
   *     tags: [Rules]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/ruleId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Rule
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Rule'
   *               examples:
   *                 - data:
   *                     id: '3ac44ad6-339a-459f-8eb6-fcff4cb87c34'
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
   *   patch:
   *     summary: Updates a rule
   *     tags: [Rules]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/ruleId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - rule
   *             type: object
   *             properties:
   *               rule:
   *                 $ref: '#/components/schemas/Rule'
   *             examples:
   *               - rule:
   *                   id: '3ac44ad6-339a-459f-8eb6-fcff4cb87c34'
   *                   stage: 'pre'
   *                   conditionsOp: 'and'
   *                   conditions:
   *                     - op: 'is'
   *                       field: 'payee'
   *                       value: '6740d5c1-5a89-4fa0-a35c-910e6da86e8r'
   *                       type: 'id'
   *                   actions:
   *                     - op: 'set'
   *                       field: 'category'
   *                       value: '9787f2b1-d145-4afc-95b5-8f39ac68f8h5'
   *                       type: 'id'
   *     responses:
   *       '200':
   *         description: Rule updated
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Rule'
   *               examples:
   *                 - data:
   *                     id: '3ac44ad6-339a-459f-8eb6-fcff4cb87c34'
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
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   delete:
   *     summary: Deletes a rule
   *     tags: [Rules]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/ruleId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Rule deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Rule deleted
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/rules/:ruleId', async (req, res, next) => {
    try {
      const allRules = await res.locals.budget.getRules() || [];
      const queriedRule = allRules.find(rule => rule.id === req.params.ruleId);
      if (!queriedRule) {
        throw new Error(`Rule with id '${req.params.ruleId}' not found`);
      }
      res.json({'data': queriedRule});
    } catch(err) {
      next(err);
    }
  });

  router.patch('/budgets/:budgetSyncId/rules/:ruleId', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.updateRule(req.body.rule)});
    } catch(err) {
      next(err);
    }
  });

  router.delete('/budgets/:budgetSyncId/rules/:ruleId', async (req, res, next) => {
    try {
      await res.locals.budget.deleteRule(req.params.ruleId);
      res.json({'message': 'Rule deleted'});
    } catch(err) {
      next(err);
    }
  });
}