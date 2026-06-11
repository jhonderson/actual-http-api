const zlib = require('zlib');
const querystring = require('querystring');
const { getActualApiClient } = require('../actual-client-provider');
const pkg = require('../../../package.json');

/**
 * @swagger
 * tags:
 *   - name: Settings
 *     description: Endpoints for settings-related operations
 * components:
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
  const { config } = require('../../config/config');
  const { EXPERIMENTAL_DISABLED_MESSAGE } = require('./constants');
  /**
   * @swagger
   * /budgets:
   *   get:
   *     summary: Returns a list of all budget files either locally cached or on the remote server. Remote files have a state field and local files have an id field.
   *     tags: [Settings]
   *     security:
   *       - apiKey: []
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
  router.get('/budgets', async (req, res, next) => {
    try {
      const apiClient = await getActualApiClient();
      res.json({ data: await apiClient.getBudgets() });
    } catch (err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /actualhttpapiversion:
   *   get:
   *     summary: Returns the version of the Actual HTTP API.
   *     tags: [Settings]
   *     security:
   *       - apiKey: []
   *     responses:
   *       '200':
   *         description: The version of the Actual HTTP API
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     version:
   *                       type: string
   *               examples:
   *                 - data:
   *                     version: '26.3.0'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/actualhttpapiversion', async (req, res, next) => {
    try {
      res.json({ data: { version: pkg.version } });
    } catch (err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/actualserverversion:
   *   get:
   *     summary: Returns the version of the Actual server.
   *     tags: [Settings]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The version of the Actual server
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     version:
   *                       type: string
   *               examples:
   *                 - data:
   *                     version: '26.3.0'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/actualserverversion', async (req, res, next) => {
    try {
      const actualVersionResponse = await res.locals.budget.getServerVersion();
      if (actualVersionResponse.error) {
        throw new Error(`Error fetching actual server version: ${actualVersionResponse.error}`);
      }
      res.json({ data: actualVersionResponse });
    } catch (err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/export:
   *   get:
   *     summary: "(⚠️ Unofficial) Exports the budget data as a zip file containing db.sqlite and metadata.json files."
   *     description: "⚠️ Unofficial: Interacts with the internals of the official library APIs. It is not considered stable or secure for use and may change without notice."
   *     tags: [Settings]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The budget data as a zip file containing db.sqlite and metadata.json files
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *       '501':
   *         $ref: '#/components/responses/501'
   */
  router.get('/budgets/:budgetSyncId/export', async (req, res, next) => {
    try {
      if (!config.experimentalOperationsEnabled) {
        return res.status(501).json({ error: EXPERIMENTAL_DISABLED_MESSAGE });
      }
      const { fileName, fileStream } = await res.locals.budget.exportData(req.params.budgetSyncId);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(fileName)}`);
      fileStream.pipe(res);
      fileStream.finalize();
      fileStream.on('error', err => {
        if (!res.headersSent) res.status(500).send('Failed to generate zip');
      });
    } catch (err) {
      next(err);
    }
  });
}