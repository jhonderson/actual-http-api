const { isEmpty } = require('../../utils/utils');

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Endpoints for managing categories. See [Categories official documentation](https://actualbudget.org/docs/api/reference#categories)
 * components:
 *   parameters:
 *     categoryId:
 *       name: categoryId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Category id
 *     categoryGroupId:
 *       name: categoryGroupId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Category group id
 *   schemas:
 *     CategoryGroup:
 *       required:
 *         - name
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *            type: integer
 *         is_income:
 *            type: boolean
 *         hidden:
 *            type: boolean
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *             description: 'An array of categories in this group. Not valid when creating or updating a category group. Only available in a get.'
 *     Category:
 *       required:
 *         - name
 *         - group_id
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *            type: integer
 *         is_income:
 *            type: boolean
 *         hidden:
 *            type: boolean
 *         group_id:
 *           type: string
 */

module.exports = (router) => {
  /**
   * @swagger
   * /budgets/{budgetSyncId}/categories:
   *   get:
   *     summary: Returns list of categories
   *     tags: [Categories]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The list of categories
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
   *                     $ref: '#/components/schemas/Category'
   *               examples:
   *                 - data:
   *                   - id: '106963b3-ab82-4734-ad70-1d7dc2a52ff4'
   *                     name: 'For Spending'
   *                     is_income: false
   *                     hidden: false
   *                     group_id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   post:
   *     summary: Creates a category
   *     tags: [Categories]
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
   *               - category
   *             type: object
   *             properties:
   *               category:
   *                 $ref: '#/components/schemas/Category'
   *             examples:
   *               - category:
   *                   name: 'For Spending'
   *                   is_income: false
   *                   hidden: false
   *                   group_id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *     responses:
   *       '201':
   *         description: Category id
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   type: string
   *                   description: Category id
   *               examples:
   *                 - data: "106963b3-ab82-4734-ad70-1d7dc2a52ff4"
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/categories', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.getCategories()});
    } catch(err) {
      next(err);
    }
  });
  
  router.post('/budgets/:budgetSyncId/categories', async (req, res, next) => {
    try {
      validateCategoryBody(req.body.category);
      res.json({'data': await res.locals.budget.createCategory(req.body.category)});
    } catch(err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/categories/{categoryId}:
   *   get:
   *     summary: Returns a category information
   *     tags: [Categories]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/categoryId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Category information
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Category'
   *               examples:
   *                 - data:
   *                     id: '106963b3-ab82-4734-ad70-1d7dc2a52ff4'
   *                     name: 'For Spending'
   *                     is_income: false
   *                     hidden: false
   *                     group_id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   patch:
   *     summary: Updates a category
   *     tags: [Categories]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/categoryId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - category
   *             type: object
   *             properties:
   *               category:
   *                 $ref: '#/components/schemas/Category'
   *             examples:
   *               - category:
   *                   name: 'For Spending'
   *                   is_income: false
   *                   hidden: false
   *                   group_id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *     responses:
   *       '200':
   *         description: Category updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Category updated
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   delete:
   *     summary: Deletes a category
   *     tags: [Categories]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/categoryId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *       - name: transfer_category_id
   *         in: query
   *         schema:
   *           type: string
   *           description: Destination category id
   *           examples:
   *             - '106963b3-ab82-4734-ad70-1d7dc2a52ff4'
   *     responses:
   *       '200':
   *         description: Category deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Category deleted
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/categories/:categoryId', async (req, res, next) => {
    try {
      const category = await res.locals.budget.getCategory(req.params.categoryId);
      if (category) {
        res.json({'data': category});
      } else {
        throw new Error('Category not found');
      }
    } catch(err) {
      next(err);
    }
  });
  
  router.patch('/budgets/:budgetSyncId/categories/:categoryId', async (req, res, next) => {
    try {
      validateCategoryBody(req.body.category);
      const category = await res.locals.budget.getCategory(req.params.categoryId);
      if (category) {
        await res.locals.budget.updateCategory(req.params.categoryId, req.body.category);
        res.json({'message': 'Category updated'});
      } else {
        throw new Error('Category not found');
      }
    } catch(err) {
      next(err);
    }
  });
  
  router.delete('/budgets/:budgetSyncId/categories/:categoryId', async (req, res, next) => {
    try {
      const category = await res.locals.budget.getCategory(req.params.categoryId);
      if (category) {
        await res.locals.budget.deleteCategory(req.params.categoryId, {transferCategoryId: req.query.transfer_category_id});
        res.json({'message': 'Category deleted'});
      } else {
        throw new Error('Category not found');
      }
    } catch(err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/categorygroups:
   *   get:
   *     summary: Returns list of category groups
   *     tags: [Categories]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The list of category groups
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
   *                     $ref: '#/components/schemas/CategoryGroup'
   *               examples:
   *                 - data:
   *                   - id: '106963b3-ab82-4734-ad70-1d7dc2a52ff4'
   *                     name: 'For Spending'
   *                     is_income: false
   *                     hidden: false
   *                     group_id: 'd4394761-0427-4ad4-bde7-9a83e118541a'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   post:
   *     summary: Creates a category group
   *     tags: [Categories]
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
   *               - category_group
   *             type: object
   *             properties:
   *               category_group:
   *                 $ref: '#/components/schemas/CategoryGroup'
   *             examples:
   *               - category_group:
   *                   name: 'Bills'
   *                   is_income: false
   *                   hidden: false
   *     responses:
   *       '201':
   *         description: Category group id
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   type: string
   *                   description: Category group id
   *               examples:
   *                 - data: "2E1F5BDB-209B-43F9-AF2C-3CE28E380C00"
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */

  router.get('/budgets/:budgetSyncId/categorygroups', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.getCategoryGroups()});
    } catch(err) {
      next(err);
    }
  });
  
  router.post('/budgets/:budgetSyncId/categorygroups', async (req, res, next) => {
    try {
      validateCategoryGroupBody(req.body.category_group);
      res.json({'data': await res.locals.budget.createCategoryGroup(req.body.category_group)});
    } catch(err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/categorygroups/{categoryGroupId}:
   *   patch:
   *     summary: Updates a category group
   *     tags: [Categories]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/categoryGroupId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - category_group
   *             type: object
   *             properties:
   *               category_group:
   *                 $ref: '#/components/schemas/Category'
   *             examples:
   *               - category_group:
   *                   name: 'Bills'
   *                   is_income: false
   *                   hidden: false
   *     responses:
   *       '200':
   *         description: Category group updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Category group updated
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   *   delete:
   *     summary: Deletes a category group
   *     tags: [Categories]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/categoryGroupId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *       - name: transfer_category_id
   *         in: query
   *         schema:
   *           type: string
   *           description: Destination category id
   *           examples:
   *             - '106963b3-ab82-4734-ad70-1d7dc2a52ff4'
   *     responses:
   *       '200':
   *         description: Category group deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Category group deleted
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.patch('/budgets/:budgetSyncId/categorygroups/:categoryGroupId', async (req, res, next) => {
    try {
      validateCategoryGroupBody(req.body.category_group);
      await res.locals.budget.updateCategoryGroup(req.params.categoryGroupId, req.body.category_group);
      res.json({'message': 'Category group updated'});
    } catch(err) {
      next(err);
    }
  });
  
  router.delete('/budgets/:budgetSyncId/categorygroups/:categoryGroupId', async (req, res, next) => {
    try {
      await res.locals.budget.deleteCategoryGroup(req.params.categoryGroupId, {transferCategoryId: req.query.transfer_category_id});
      res.json({'message': 'Category group deleted'});
    } catch(err) {
      next(err);
    }
  });

  function validateCategoryBody(category) {
    if (isEmpty(category)) {
      throw new Error('category information is required');
    }
  }

  function validateCategoryGroupBody(categoryGroup) {
    if (isEmpty(categoryGroup)) {
      throw new Error('category_group information is required');
    }
  }
}