const express = require('express');
const { Budget } = require('../budget');
const { authorizeRequest } = require('../middlewares/api-key-authorization');
const { errorHandler } = require('../middlewares/error-handler');
const { config } = require('../../config/config');

const router = express.Router();

// Must be registered before the /budgets/:budgetSyncId middleware below, otherwise
// :budgetSyncId captures the literal string "import" and the request is treated as a
// request for a budget with that sync id. This route applies authorizeRequest itself.
require('./import')(router);

router.use('/budgets/:budgetSyncId', authorizeRequest, async (req, res, next) => {
    try {
      if (config.allowedBudgetSyncIds && !config.allowedBudgetSyncIds.includes(req.params.budgetSyncId)) {
        res.status(403).json({"error": "Forbidden"});
        return;
      }
      res.locals.budget = await Budget(req.params.budgetSyncId, req.get('budget-encryption-password'));
      next();
    } catch(err) {
      next(err);
    }
  });

require('./budget-months')(router);
require('./accounts')(router);
require('./account-groups')(router);
require('./transactions')(router);
require('./categories')(router);
require('./rules')(router);
require('./payees')(router);
require('./schedules')(router);
require('./settings')(router);
require('./run-query')(router);
require('./tags')(router);
require('./notes')(router);
require('./utils')(router);

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
 *     budgetEncryptionPassword:
 *       name: budget-encryption-password
 *       in: header
 *       schema:
 *         type: string
 *       required: false
 *       description: Optional encryption password for end-to-end encrypted budgets. You may need to provide it again after a service restart or Actual API client reset before reopening a cached encrypted budget
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
 *            examples:
 *              - error: 'Invalid month format, use YYYY-MM: 2019-999'
 *     '404':
 *      description: Resource not found
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/GeneralError'
 *            examples:
 *              - error: 'No budget exists for month: 2019-01'
 *     '501':
 *      description: Operation unsupported error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/GeneralError'
 *            examples:
 *              - error: 'This operation is experimental and is currently disabled.'
 *     '500':
 *      description: Internal server error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/GeneralError'
 *            examples:
 *              - error: 'Error accessing Actual Server, check Actual Server url'
 */
