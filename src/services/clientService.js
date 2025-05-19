/**
 * Client Service
 * Handles all operations related to the client entity
 */

const CLIENT_TABLE = 'client';

// Define updateable fields based on the schema
const updateableFields = [
  'Name',
  'Tags',
  'Owner'
];

const clientService = {
  /**
   * Get all clients with pagination and optional filters
   */
  getClients: async (filters = {}, page = 1, limit = 20) => {
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

      const response = await apperClient.fetchRecords(CLIENT_TABLE, params);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  },

  /**
   * Get a single client by ID
   */
  getClientById: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.getRecordById(CLIENT_TABLE, id);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new client
   */
  createClient: async (clientData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Filter to only include updateable fields
      const filteredData = Object.keys(clientData)
        .filter(key => updateableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = clientData[key];
          return obj;
        }, {});

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(CLIENT_TABLE, params);
      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  },

  /**
   * Update an existing client
   */
  updateClient: async (id, clientData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Filter to only include updateable fields
      const filteredData = Object.keys(clientData)
        .filter(key => updateableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = clientData[key];
          return obj;
        }, { Id: id });

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.updateRecord(CLIENT_TABLE, params);
      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error(`Error updating client with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a client
   */
  deleteClient: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord(CLIENT_TABLE, params);
      return response.success || false;
    } catch (error) {
      console.error(`Error deleting client with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get client statistics
   */
  getClientStats: async () => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Count all clients
      const response = await apperClient.fetchRecords(CLIENT_TABLE, {});
      return response.data?.length || 0;
    } catch (error) {
      console.error("Error fetching client stats:", error);
      throw error;
    }
  }
};

export default clientService;