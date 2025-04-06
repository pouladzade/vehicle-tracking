/**
 * Generic repository interface for basic CRUD operations
 * @template T The entity type
 * @template ID The ID type (usually number)
 * @template C The creation DTO type
 */
export interface Repository<T, ID, C> {
  /**
   * Find all entities of type T
   */
  findAll(): Promise<T[]>;

  /**
   * Find entity by ID
   * @param id Entity ID
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Create a new entity
   * @param data Entity creation data
   */
  create(data: C): Promise<T>;

  /**
   * Update an existing entity
   * @param id Entity ID
   * @param data Entity update data
   */
  update(id: ID, data: C): Promise<T | null>;

  /**
   * Delete an entity
   * @param id Entity ID
   */
  delete(id: ID): Promise<boolean>;
}
