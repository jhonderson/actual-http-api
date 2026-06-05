/**
 * @swagger
 * tags:
 *   - name: Utils
 *     description: Utility endpoints
 */

module.exports = (router) => {
  /**
   * @swagger
   * /budgets/{budgetSyncId}/id-by-name:
   *   get:
   *     summary: Get the ID of an entity by its name
   *     tags: [Utils]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *       - in: query
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *           enum: [accounts, schedules, categories, payees]
   *         description: Entity type to look up
   *       - in: query
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *         description: The name to look up
   *     responses:
   *       '200':
   *         description: The ID of the matching entity
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   type: string
   *                   description: Entity UUID
   *               examples:
   *                 - data: '671b669d-b616-4bf1-8a04-c82d73f87d5b'
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/id-by-name', async (req, res, next) => {
    try {
      const { type, name } = req.query;
      if (!type || !name) {
        throw Object.assign(
          new Error('Query parameters "type" and "name" are required'),
          { status: 400 }
        );
      }
      const validTypes = ['accounts', 'schedules', 'categories', 'payees'];
      if (!validTypes.includes(type)) {
        throw Object.assign(
          new Error(`"type" must be one of: ${validTypes.join(', ')}`),
          { status: 400 }
        );
      }
      const id = await res.locals.budget.getIDByName(type, name);
      res.json({ data: id });
    } catch (err) {
      next(err);
    }
  });
};
