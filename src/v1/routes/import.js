const express = require('express');
const { importBudgetData } = require('../budget');
const { authorizeRequest } = require('../middlewares/api-key-authorization');

const IMPORT_TYPES = ['actual', 'ynab4', 'ynab5'];

// ynab5 files are JSON, but are read as raw bytes here because the global express.json()
// in server.js would otherwise parse them into an object before this route runs
const IMPORT_CONTENT_TYPES = ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'];

const IMPORT_MAX_SIZE = '500mb';

module.exports = (router) => {
  const { config } = require('../../config/config');
  const { EXPERIMENTAL_DISABLED_MESSAGE } = require('./constants');
  /**
   * @swagger
   * /budgets/import:
   *   post:
   *     summary: "(🔧 Extended) Imports a budget from an Actual export or a YNAB4/YNAB5 file."
   *     description: "🔧 Extended: Uses the official importBudget API, returning the sync id of the imported budget.
   *       Note that importing a budget that already exists does not restore it in place: the Actual library clears the
   *       file's server identity on import, so the budget is uploaded as a new file and receives a NEW sync id. The
   *       original budget and its sync id are left untouched."
   *     tags: [Settings]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - name: type
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *           enum: [actual, ynab4, ynab5]
   *           default: actual
   *         description: The format of the uploaded file
   *       - name: filename
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *         description: Used to derive the budget name when importing YNAB files
   *     requestBody:
   *       required: true
   *       description: The raw budget file. Actual and YNAB4 exports are zip files, YNAB5 exports are JSON
   *       content:
   *         application/zip:
   *           schema:
   *             type: string
   *             format: binary
   *         application/octet-stream:
   *           schema:
   *             type: string
   *             format: binary
   *     responses:
   *       '201':
   *         description: The imported budget
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   required:
   *                     - id
   *                     - syncId
   *                     - name
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     syncId:
   *                       type: string
   *                       description: The sync id of the imported budget, used by every other endpoint
   *                     name:
   *                       type: string
   *               examples:
   *                 - data:
   *                     id: 'My-Finances-5e3e565'
   *                     syncId: 'a232c399-e28c-4a51-96be-d1183129d1f9'
   *                     name: 'Actual Bench Test'
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '500':
   *         $ref: '#/components/responses/500'
   *       '501':
   *         $ref: '#/components/responses/501'
   */
  router.post('/budgets/import',
    authorizeRequest,
    express.raw({ type: IMPORT_CONTENT_TYPES, limit: IMPORT_MAX_SIZE }),
    async (req, res, next) => {
      try {
        if (!config.experimentalOperationsEnabled) {
          return res.status(501).json({ error: EXPERIMENTAL_DISABLED_MESSAGE });
        }
        const type = req.query.type || 'actual';
        if (!IMPORT_TYPES.includes(type)) {
          throw new Error(`type must be one of: ${IMPORT_TYPES.join(', ')}`);
        }
        if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
          throw new Error('A budget file is required as the raw request body');
        }
        res.status(201).json({
          data: await importBudgetData(req.body, { type, filename: req.query.filename })
        });
      } catch (err) {
        next(err);
      }
    });
};
