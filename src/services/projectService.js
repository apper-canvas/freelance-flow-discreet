/**
 * Project Service
 * Handles all operations related to the project entity
 */

const PROJECT_TABLE = 'project2';

// Define updateable fields based on the schema
const updateableFields = [
  'Name',
  'Tags',
  'Owner',
  'description',
  'startDate',
  'endDate',
  'manager',
  'priority',
  'status',
  'budget',
  'client'
];

const projectService = {
  /**
   * Get all projects with pagination and optional filters
   */
  getProjects: async (filters = {}, page = 1, limit = 20) => {
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

      const response = await apperClient.fetchRecords(PROJECT_TABLE, params);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },

  /**
   * Get a single project by ID
   */
  getProjectById: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.getRecordById(PROJECT_TABLE, id);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new project
   */
  createProject: async (projectData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Filter to only include updateable fields
      const filteredData = Object.keys(projectData)
        .filter(key => updateableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = projectData[key];
          return obj;
        }, {});

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(PROJECT_TABLE, params);
      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  /**
   * Update an existing project
   */
  updateProject: async (id, projectData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Filter to only include updateable fields
      const filteredData = Object.keys(projectData)
        .filter(key => updateableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = projectData[key];
          return obj;
        }, { Id: id });

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.updateRecord(PROJECT_TABLE, params);
      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error(`Error updating project with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a project
   */
  deleteProject: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord(PROJECT_TABLE, params);
      return response.success || false;
    } catch (error) {
      console.error(`Error deleting project with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get project statistics (active count, etc.)
   */
  getProjectStats: async () => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Count all projects
      const totalResponse = await apperClient.fetchRecords(PROJECT_TABLE, {});
      const total = totalResponse.data?.length || 0;

      // Count active projects (in-progress)
      const activeResponse = await apperClient.fetchRecords(PROJECT_TABLE, {
        where: [{
          fieldName: 'status',
          operator: 'ExactMatch',
          values: ['in-progress']
        }]
      });
      const active = activeResponse.data?.length || 0;

      return {
        total,
        active
      };
    } catch (error) {
      console.error("Error fetching project stats:", error);
      throw error;
    }
  }
};

export default projectService;