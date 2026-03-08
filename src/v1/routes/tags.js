
/**
 * @swagger
 * tags:
 *   - name: Tags
 *     description: Endpoints for managing tags. See [Tags official documentation](https://actualbudget.org/docs/api/reference#tags)
 * components:
 *   parameters:
 *     tagId:
 *       name: tagId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Tag id
 *   schemas:
 *     Tag:
 *       required:
 *         - tag
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         tag:
 *           type: string
 *         color:
 *           type: string
 *         description:
 *           type: string
 */

module.exports = (router) => {
  /**
   * @swagger
   * /budgets/{budgetSyncId}/tags:
   *   get:
   *     summary: Returns list of tags
   *     tags: [Tags]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The list of tags
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
   *                     $ref: '#/components/schemas/Tag'
   *               examples:
   *                 - data:
   *                   - id: 'f733399d-4ccb-4758-b208-7422b27f650a'
   *                     tag: 'myprettytag'
   *                     color: '#00796B'
   *                     description: 'My pretty tag'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   post:
   *     summary: Creates a tag
   *     tags: [Tags]
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
   *               - tag
   *             type: object
   *             properties:
   *               tag:
   *                 $ref: '#/components/schemas/Tag'
   *             examples:
   *               - tag:
   *                   tag: 'myprettytag'
   *                   color: '#00796B'
   *                   description: 'My pretty tag'
   *     responses:
   *       '200':
   *         description: Tag id
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   type: string
   *                   description: Tag id
   *               examples:
   *                 - data: 'f733399d-4ccb-4758-b208-7422b27f650a'
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/tags', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.getTags()});
    } catch (err) {
      next(err);
    }
  });

  router.post('/budgets/:budgetSyncId/tags', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.createTag(req.body.tag)});
    } catch (err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/tags/{tagId}:
   *   get:
   *     summary: Returns a tag
   *     tags: [Tags]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/tagId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Tag
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Tag'
   *               examples:
   *                 - data:
   *                     id: '9de084a4-dc96-4015-ac81-ba57ee340acd'
   *                     tag: 'Fidelity'
   *                     color: '#00796B'
   *                     description: 'My pretty tag'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   patch:
   *     summary: Updates a tag
   *     tags: [Tags]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/tagId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - tag
   *             type: object
   *             properties:
   *               tag:
   *                 $ref: '#/components/schemas/Tag'
   *             examples:
   *               - tag:
   *                   id: '9de084a4-dc96-4015-ac81-ba57ee340acd'
   *                   tag: 'myprettytag'
   *                   color: '#00796B'
   *                   description: 'My pretty tag'
   *     responses:
   *       '200':
   *         description: Tag updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Tag updated
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   delete:
   *     summary: Deletes a tag
   *     tags: [Tags]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/tagId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Tag deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Tag deleted
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/tags/:tagId', async (req, res, next) => {
    try {
      const allTags = await res.locals.budget.getTags() || [];
      const queriedTag = allTags.find(tag => tag.id === req.params.tagId);
      if (!queriedTag) {
        throw new Error(`Tag with id '${req.params.tagId}' not found`);
      }
      res.json({'data': queriedTag});
    } catch(err) {
      next(err);
    }
  });

  router.patch('/budgets/:budgetSyncId/tags/:tagId', async (req, res, next) => {
    try {
      await res.locals.budget.updateTag(req.params.tagId, req.body.tag);
      res.json({'message': 'Tag updated'});
    } catch(err) {
      next(err);
    }
  });

  router.delete('/budgets/:budgetSyncId/tags/:tagId', async (req, res, next) => {
    try {
      await res.locals.budget.deleteTag(req.params.tagId);
      res.json({'message': 'Tag deleted'});
    } catch(err) {
      next(err);
    }
  });
};