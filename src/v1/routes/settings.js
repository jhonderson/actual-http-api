const { currentLocalDate, formatDateToISOString } = require('../../utils/utils');
const zlib = require('zlib');

/**
 * @swagger
 * tags:
 *   - name: Settings
 *     description: Endpoints for settings-related operations
 * components:
 *   parameters:
 *     cloudFileId:
 *       name: cloudFileId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Cloud file id
 *   schemas:
 *     Budget:
 *       required:
 *         - cloudFileId
 *         - groupId
 *         - name
 *       type: object
 *       properties:
 *         cloudFileId:
 *           type: string
 *         groupId:
 *           type: string
 *         name:
 *           type: string
 *         state:
 *           type: string
 *         id:
 *           type: string
 *         encryptKeyId:
 *           type: string
 *         hasKey:
 *           type: boolean
 *         owner:
 *           type: string
 *         usersWithAccess:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserWithAccessToBudget'
 *             description: 'An array of user with access to the budget'
 *     UserWithAccessToBudget:
 *       required:
 *         - userId
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         displayName:
 *            type: string
 *         userName:
 *            type: string
 *         owner:
 *            type: boolean
 */

module.exports = (router) => {
  /**
   * @swagger
   * /budgets/{budgetSyncId}/budgets:
   *   get:
   *     summary: Returns a list of all budget files either locally cached or on the remote server. Remote files have a state field and local files have an id field.
   *     tags: [Settings]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The list of budgets
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
   *                     $ref: '#/components/schemas/Budget'
   *               examples:
   *                 - data:
   *                   - id: 'My-Finances-a12381e'
   *                     cloudFileId: 'f06d14a2-13f9-44d2-9d4a-20696edfcf7y'
   *                     groupId: '9676303d-3646-4f91-a735-bd6bb4e8631a'
   *                     name: 'My Finances'
   *                   - cloudFileId: 'f06d14a2-13f9-44d2-9d4a-20696edfcf7y'
   *                     groupId: '9676303d-3646-4f91-a735-bd6bb4e8631a'
   *                     name: 'My Finances'
   *                     hasKey: false
   *                     owner: 'eab15b69-1874-48e4-b187-b449035294fc'
   *                     usersWithAccess:
   *                     - userId: 'poe15b69-1874-48e4-b187-b449035294fc'
   *                       owner: true
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/budgets', async (req, res, next) => {
    try {
      res.json({ 'data': await res.locals.budget.getBudgets() });
    } catch (err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/export/{cloudFileId}:
   *   get:
   *     summary: (🚧 UNSTABLE) Exports the budget data as a zip file containing db.sqlite and metadata.json files. This operation is currently only supported for actual servers using password authentication method. Not suported yet for http header based authentication, nor openid authentication. Encrypted budgets are not supported yet neither.
   *     tags: [Settings]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/cloudFileId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The budget data as a zip file containing db.sqlite and metadata.json files
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/export/:cloudFileId', async (req, res, next) => {
    const { fileName, fileContentAsArrayBuffer } = await res.locals.budget.downloadBudgetFile(req.params.cloudFileId);
    try {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=${formatDateToISOString(currentLocalDate())}-${fileName}.zip`);
      const gzip = zlib.createGzip();
      gzip.pipe(res);
      gzip.end(Buffer.from(fileContentAsArrayBuffer));
    } catch (err) {
      next(err);
    }
  });
}