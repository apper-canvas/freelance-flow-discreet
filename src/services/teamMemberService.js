/**
 * Team Member Service
 * Handles all operations related to the team member entity
 */

const TEAM_MEMBER_TABLE = 'team_member';

// Define updateable fields based on the schema
const updateableFields = [
  'Name',
  'Tags',
  'Owner',
  'project'
];

const teamMemberService = {
  /**
   * Get all team members with pagination and optional filters
   */
  getTeamMembers: async (filters = {}, page = 1, limit = 20) => {
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

      const response = await apperClient.fetchRecords(TEAM_MEMBER_TABLE, params);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching team members:", error);
      throw error;
    }
  },

  /**
   * Get a single team member by ID
   */
  getTeamMemberById: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.getRecordById(TEAM_MEMBER_TABLE, id);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching team member with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new team member
   */
  createTeamMember: async (teamMemberData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Filter to only include updateable fields
      const filteredData = Object.keys(teamMemberData)
        .filter(key => updateableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = teamMemberData[key];
          return obj;
        }, {});

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(TEAM_MEMBER_TABLE, params);
      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error("Error creating team member:", error);
      throw error;
    }
  },

  /**
   * Update an existing team member
   */
  updateTeamMember: async (id, teamMemberData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Filter to only include updateable fields
      const filteredData = Object.keys(teamMemberData)
        .filter(key => updateableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = teamMemberData[key];
          return obj;
        }, { Id: id });

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.updateRecord(TEAM_MEMBER_TABLE, params);
      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error(`Error updating team member with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a team member
   */
  deleteTeamMember: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord(TEAM_MEMBER_TABLE, params);
      return response.success || false;
    } catch (error) {
      console.error(`Error deleting team member with ID ${id}:`, error);
      throw error;
    }
  }
};

export default teamMemberService;