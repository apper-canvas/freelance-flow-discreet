/**
 * Time Entry Service
 * Handles all operations related to the time entry entity
 */

const TIME_ENTRY_TABLE = 'time_entry';

// Define updateable fields based on the schema
const updateableFields = [
  'Name',
  'Tags',
  'Owner',
  'task',
  'description',
  'startTime',
  'endTime',
  'duration',
  'project'
];

const timeEntryService = {
  /**
   * Get all time entries with pagination and optional filters
   */
  getTimeEntries: async (filters = {}, page = 1, limit = 20) => {
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

      const response = await apperClient.fetchRecords(TIME_ENTRY_TABLE, params);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching time entries:", error);
      throw error;
    }
  },

  /**
   * Get a single time entry by ID
   */
  getTimeEntryById: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.getRecordById(TIME_ENTRY_TABLE, id);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching time entry with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new time entry
   */
  createTimeEntry: async (timeEntryData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Filter to only include updateable fields
      const filteredData = Object.keys(timeEntryData)
        .filter(key => updateableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = timeEntryData[key];
          return obj;
        }, {});

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(TIME_ENTRY_TABLE, params);
      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error("Error creating time entry:", error);
      throw error;
    }
  },

  /**
   * Delete a time entry
   */
  deleteTimeEntry: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord(TIME_ENTRY_TABLE, params);
      return response.success || false;
    } catch (error) {
      console.error(`Error deleting time entry with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get time entry statistics (total hours tracked)
   */
  getTrackedHours: async () => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Get all time entries
      const response = await apperClient.fetchRecords(TIME_ENTRY_TABLE, {});
      
      // Calculate total hours
      const entries = response.data || [];
      const totalMinutes = entries.reduce((sum, entry) => {
        return sum + (entry.duration || 0);
      }, 0);
      
      return totalMinutes / 60; // Convert to hours
    } catch (error) {
      console.error("Error calculating tracked hours:", error);
      throw error;
    }
  }
};

export default timeEntryService;