const express = require('express');
const { Budget } = require('../budget');
const { authorizeRequest } = require('../middlewares/api-key-authorization');
const { errorHandler } = require('../middlewares/error-handler');

const router = express.Router();

router.use('/budgets/:budgetSyncId', authorizeRequest, async (req, res, next) => {
    try {
      res.locals.budget = await Budget(req.params.budgetSyncId, req.get('budget-encryption-password'));
      next();
    } catch(err) {
      next(err);
    }
  });

require('./budget-months')(router);
require('./accounts')(router);
require('./transactions')(router);
require('./categories')(router);
require('./rules')(router);
require('./payees')(router);
require('./settings')(router);

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
 *       description: Optional encryption password for end-to-end encrypted budgets. Only needed in the first interaction with the encrypted budget, subsequent requests don't need to provide this value
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
 *     '500':
 *      description: Internal server error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/GeneralError'
 *            examples:
 *              - error: 'Error accessing Actual Server, check Actual Server url'
 */
