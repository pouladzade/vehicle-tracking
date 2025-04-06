/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the customer
 *         name:
 *           type: string
 *           description: The customer's name
 *         email:
 *           type: string
 *           format: email
 *           description: The customer's email address
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         id: 1
 *         name: "Acme Transportation"
 *         email: "contact@speedylogistics.com"
 *         created_at: "2023-01-01T00:00:00.000Z"
 *         updated_at: "2023-01-01T00:00:00.000Z"
 */

export interface Customer {
  id?: number;
  name: string;
  email?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CustomerInput {
  name: string;
  email?: string;
}
