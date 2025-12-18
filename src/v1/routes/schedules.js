const { validatePaginationParameters, paginate } = require('../../utils/utils');

/**
 * @swagger
 * tags:
 *   - name: Schedules
 *     description: Endpoints for managing schedules. See [Schedules official documentation](https://actualbudget.org/docs/api/reference#schedule)
 * components:
 *   parameters:
 *     scheduleId:
 *       name: scheduleId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Schedule id
 *   schemas:
 *     RecurConfig:
 *       type: object
 *       required:
 *         - frequency
 *         - start
 *         - endMode
 *       properties:
 *         frequency:
 *           type: string
 *           enum: ['daily', 'weekly', 'monthly', 'yearly']
 *           description: Repetition frequency
 *         interval:
 *           type: number
 *           description: Recurrence interval (default 1)
 *         patterns:
 *           type: array
 *           items:
 *             type: object
 *           description: Specific recurrence patterns
 *         skipWeekend:
 *           type: boolean
 *           description: Skip weekends when calculating dates
 *         start:
 *           type: string
 *           format: date
 *           description: ISO date string for recurrence start
 *         endMode:
 *           type: string
 *           enum: ['never', 'after_n_occurrences', 'on_date']
 *           description: Specifies recurrence termination
 *         endOccurrences:
 *           type: number
 *           description: Count when endMode is after_n_occurrences
 *         endDate:
 *           type: string
 *           format: date
 *           description: ISO date when endMode is on_date
 *         weekendSolveMode:
 *           type: string
 *           enum: ['before', 'after']
 *           description: Adjusts dates falling on weekends
 *     Schedule:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID identifier
 *         name:
 *           type: string
 *           description: Schedule name (must be unique)
 *         rule:
 *           type: string
 *           description: Associated underlying rule (auto-created)
 *         next_date:
 *           type: string
 *           format: date
 *           description: Next occurrence date
 *         completed:
 *           type: boolean
 *           description: Whether the schedule is completed
 *         posts_transaction:
 *           type: boolean
 *           description: Auto-post transactions (default false)
 *         payee:
 *           type: string
 *           nullable: true
 *           description: Payee ID
 *         account:
 *           type: string
 *           nullable: true
 *           description: Account ID
 *         amount:
 *           oneOf:
 *             - type: number
 *             - type: object
 *               properties:
 *                 num1:
 *                   type: number
 *                 num2:
 *                   type: number
 *           description: Amount or range for isbetween
 *         amountOp:
 *           type: string
 *           enum: ['is', 'isapprox', 'isbetween']
 *           description: Controls amount interpretation
 *         date:
 *           oneOf:
 *             - type: string
 *               format: date
 *             - $ref: '#/components/schemas/RecurConfig'
 *           description: Single occurrence date or recurring pattern
 *     ScheduleInput:
 *       type: object
 *       required:
 *         - date
 *       properties:
 *         name:
 *           type: string
 *           description: Schedule name (must be unique)
 *         posts_transaction:
 *           type: boolean
 *           description: Auto-post transactions (default false)
 *         payee:
 *           type: string
 *           nullable: true
 *           description: Payee ID
 *         account:
 *           type: string
 *           nullable: true
 *           description: Account ID
 *         amount:
 *           oneOf:
 *             - type: number
 *             - type: object
 *               properties:
 *                 num1:
 *                   type: number
 *                 num2:
 *                   type: number
 *           description: Amount or range for isbetween
 *         amountOp:
 *           type: string
 *           enum: ['is', 'isapprox', 'isbetween']
 *           description: Controls amount interpretation
 *         date:
 *           oneOf:
 *             - type: string
 *               format: date
 *             - $ref: '#/components/schemas/RecurConfig'
 *           description: Single occurrence date or recurring pattern
 */

module.exports = (router) => {
  /**
   * @swagger
   * /budgets/{budgetSyncId}/schedules:
   *   get:
   *     summary: Returns list of schedules for the budget associated with the sync id specified
   *     tags: [Schedules]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *       - $ref: '#/components/parameters/page'
   *       - $ref: '#/components/parameters/limit'
   *     responses:
   *       '200':
   *         description: The list of schedules for the specified budget
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
   *                     $ref: '#/components/schemas/Schedule'
   *               examples:
   *                 - data:
   *                   - id: '3ac44ad6-339a-459f-8eb6-fcff4cb87c34'
   *                     name: 'Monthly Rent'
   *                     next_date: '2024-02-01'
   *                     completed: false
   *                     posts_transaction: true
   *                     amount: -150000
   *                     amountOp: 'is'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   post:
   *     summary: Creates a schedule
   *     tags: [Schedules]
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
   *               - schedule
   *             type: object
   *             properties:
   *               schedule:
   *                 $ref: '#/components/schemas/ScheduleInput'
   *             examples:
   *               - schedule:
   *                   name: 'Monthly Rent'
   *                   posts_transaction: true
   *                   payee: '6740d5c1-5a89-4fa0-a35c-910e6da86e8r'
   *                   account: '9787f2b1-d145-4afc-95b5-8f39ac68f8h5'
   *                   amount: -150000
   *                   amountOp: 'is'
   *                   date:
   *                     frequency: 'monthly'
   *                     start: '2024-01-01'
   *                     endMode: 'never'
   *     responses:
   *       '200':
   *         description: Schedule created
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   type: string
   *                   description: The ID of the created schedule
   *               examples:
   *                 - data: '3ac44ad6-339a-459f-8eb6-fcff4cb87c34'
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/schedules', async (req, res, next) => {
    try {
      let allSchedules = await res.locals.budget.getSchedules();
      if (req.query.page || req.query.limit) {
        validatePaginationParameters(req);
        res.json({ 'data': paginate(allSchedules, parseInt(req.query.page), parseInt(req.query.limit)) });
      } else {
        res.json({ 'data': allSchedules });
      }
    } catch (err) {
      next(err);
    }
  });

  router.post('/budgets/:budgetSyncId/schedules', async (req, res, next) => {
    try {
      validateScheduleBody(req.body);
      res.json({ 'data': await res.locals.budget.createSchedule(req.body.schedule) });
    } catch (err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/schedules/{scheduleId}:
   *   get:
   *     summary: Returns a schedule
   *     tags: [Schedules]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/scheduleId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Schedule
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Schedule'
   *               examples:
   *                 - data:
   *                     id: '3ac44ad6-339a-459f-8eb6-fcff4cb87c34'
   *                     name: 'Monthly Rent'
   *                     next_date: '2024-02-01'
   *                     completed: false
   *                     posts_transaction: true
   *                     amount: -150000
   *                     amountOp: 'is'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   patch:
   *     summary: Updates a schedule
   *     tags: [Schedules]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/scheduleId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - schedule
   *             type: object
   *             properties:
   *               schedule:
   *                 $ref: '#/components/schemas/ScheduleInput'
   *             examples:
   *               - schedule:
   *                   name: 'Updated Rent Payment'
   *                   amount: -160000
   *     responses:
   *       '200':
   *         description: Schedule updated
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Schedule'
   *               examples:
   *                 - data:
   *                     id: '3ac44ad6-339a-459f-8eb6-fcff4cb87c34'
   *                     name: 'Updated Rent Payment'
   *                     amount: -160000
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   delete:
   *     summary: Deletes a schedule
   *     tags: [Schedules]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/scheduleId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Schedule deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Schedule deleted
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/schedules/:scheduleId', async (req, res, next) => {
    try {
      const schedule = await res.locals.budget.getSchedule(req.params.scheduleId);
      if (!schedule) {
        throw new Error(`Schedule with id '${req.params.scheduleId}' not found`);
      }
      res.json({ 'data': schedule });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/budgets/:budgetSyncId/schedules/:scheduleId', async (req, res, next) => {
    try {
      validateScheduleBody(req.body);
      res.json({ 'data': await res.locals.budget.updateSchedule(req.params.scheduleId, req.body.schedule) });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/budgets/:budgetSyncId/schedules/:scheduleId', async (req, res, next) => {
    try {
      await res.locals.budget.deleteSchedule(req.params.scheduleId);
      res.json({ 'message': 'Schedule deleted' });
    } catch (err) {
      next(err);
    }
  });
};

function validateScheduleBody(body) {
  if (!body || !body.schedule) {
    throw new Error('Schedule information is required');
  }
}
