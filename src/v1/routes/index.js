const express = require('express');
const { Budget } = require('../budget');
const { authorizeRequest } = require('../middlewares/api-key-authorization');
const { errorHandler } = require('../middlewares/error-handler');

const router = express.Router();

router.use('/budgets/:budgetSyncId', authorizeRequest, async (req, res, next) => {
    try {
      res.locals.budget = await Budget(req.params.budgetSyncId);
      next();
    } catch(err) {
      next(err);
    }
  });

require('./budget-months')(router);
require('./accounts')(router);
require('./transactions')(router);
require('./categories')(router);
require('./payees')(router);

router.use(errorHandler);

module.exports = router;

/**
 * @swagger
 * components:
 *   parameters:
 *     budgetSyncId:
 *       name: budgetSyncId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: This is the Synchronization ID from Actual Budget → Settings → Show advanced settings → Sync ID
 *       example: 7195a54b-dc6b-4875-b0ef-d60eaff8c98e
 *   schemas:
 *     GeneralError:
 *      type: object
 *      properties:
 *        error:
 *          type: string
 *     GeneralResponseMessage:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *   responses:
 *     '400':
 *      description: Invalid input
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/GeneralError'
 *            example:
 *              error: 'Invalid month format, use YYYY-MM: 2019-999'
 *     '404':
 *      description: Resource not found
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/GeneralError'
 *            example:
 *              error: 'No budget exists for month: 2019-01'
 *     '500':
 *      description: Internal server error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/GeneralError'
 *            example:
 *              error: 'Error accessing Actual Server, check Actual Server url'
 */
