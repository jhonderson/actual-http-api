/**
 * @swagger
 * tags:
 *   - name: Query
 *     description: Endpoints for running ActualQL queries.
 * components:
 *   schemas:
 *     ActualQLquery:
 *       type: object
 *       required:
 *         - table
 *       properties:
 *         table:
 *           type: string
 *           description: The table to query (e.g., 'transactions').
 *         filter:
 *           type: object
 *           description: Filter criteria.
 *         select:
 *           type: array
 *           items:
 *             type: string
 *           description: Fields to select.
 *         options:
 *           type: object
 *           description: Query options.
 *         groupBy:
 *           type: array
 *           items:
 *             type: string
 *           description: Fields to group by.
 *         orderBy:
 *           type: array
 *           items:
 *             type: object
 *           description: Ordering criteria.
 *         limit:
 *           type: integer
 *           description: Limit the number of results.
 *         offset:
 *           type: integer
 *           description: Offset for results.
 *         calculate:
 *           type: object
 *           description: Calculation expression.
 *         unfilter:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of filter keys to remove.
 *         raw:
 *           type: boolean
 *           description: Return raw results.
 *         withDead:
 *           type: boolean
 *           description: Include deleted items.
 *         withoutValidatedRefs:
 *           type: boolean
 *           description: Disable reference validation.
 */

module.exports = (router) => {
  /**
   * @swagger
   * /budgets/{budgetSyncId}/run-query:
   *   post:
   *     summary: Runs an arbitrary ActualQL query
   *     tags: [Query]
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
   *               - ActualQLquery
   *             type: object
   *             properties:
   *               ActualQLquery:
   *                 $ref: '#/components/schemas/ActualQLquery'
   *     responses:
   *       '200':
   *         description: The result of the query
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.post('/budgets/:budgetSyncId/run-query', async (req, res, next) => {
    try {
      const queryParams = req.body.ActualQLquery;
      if (!queryParams) {
        throw new Error('ActualQLquery is required in the request body');
      }
      if (!queryParams.table) {
        throw new Error('table is required in ActualQLquery');
      }

      let query = res.locals.budget.q(queryParams.table);

      // These methods can be called multiple times to append expressions
      ['filter', 'groupBy', 'orderBy'].forEach((method) => {
        if (queryParams[method] !== undefined) {
          const exprs = Array.isArray(queryParams[method])
            ? queryParams[method]
            : [queryParams[method]];
          exprs.forEach((expr) => {
            query = query[method](expr);
          });
        }
      });

      // These methods set a value (or accept an array as a single argument like unfilter)
      ['select', 'calculate', 'options', 'limit', 'offset', 'unfilter'].forEach(
        (method) => {
          if (queryParams[method] !== undefined) {
            query = query[method](queryParams[method]);
          }
        }
      );

      // Boolean flags
      if (queryParams.raw === true) query = query.raw();
      if (queryParams.withDead === true) query = query.withDead();
      if (queryParams.withoutValidatedRefs === true)
        query = query.withoutValidatedRefs();
      const result = await res.locals.budget.runQuery(query);
      res.json({ data: result.data });
    } catch (err) {
      next(err);
    }
  });
};
