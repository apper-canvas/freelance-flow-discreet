/**
 * Tag Service
 * Handles all operations related to the tag entity
 */

const TAG_TABLE = 'tag';

// Define updateable fields based on the schema
const updateableFields = [
  'Name',
  'Tags',
  'Owner',
  'project'
];

const tagService = {
  /**
   * Get all tags with pagination and optional filters
   */
  getTags: async (filters = {}, page = 1, limit = 20) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        pagingInfo: {
          limit,
          offset: (page - 1) * limit
        }
      };

      // Add filters if provided
      if (Object.keys(filters).length > 0) {
        params.where = Object.keys(filters).map(key => ({
          fieldName: key,
          operator: 'ExactMatch',
          values: [filters[key]]
        }));
      }

      const response = await apperClient.fetchRecords(TAG_TABLE, params);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  },

  /**
   * Get a single tag by ID
   */
  getTagById: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.getRecordById(TAG_TABLE, id);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching tag with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new tag
   */
  createTag: async (tagData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Filter to only include updateable fields
      const filteredData = Object.keys(tagData)
        .filter(key => updateableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = tagData[key];
          return obj;
        }, {});

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(TAG_TABLE, params);
      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error("Error creating tag:", error);
      throw error;
    }
  },

  /**
   * Update an existing tag
   */
  updateTag: async (id, tagData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Filter to only include updateable fields
      const filteredData = Object.keys(tagData)
        .filter(key => updateableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = tagData[key];
          return obj;
        }, { Id: id });

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.updateRecord(TAG_TABLE, params);
      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error(`Error updating tag with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a tag
   */
  deleteTag: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord(TAG_TABLE, params);
      return response.success || false;
    } catch (error) {
      console.error(`Error deleting tag with ID ${id}:`, error);
      throw error;
    }
  }
};

export default tagService;