/**
 * Attachment Service
 * Handles all operations related to the attachment entity
 */

const ATTACHMENT_TABLE = 'Attachment1';

// Define updateable fields based on the schema
const updateableFields = [
  'Name',
  'Tags',
  'Owner',
  'type',
  'size',
  'url',
  'project'
];

const attachmentService = {
  /**
   * Get all attachments with pagination and optional filters
   */
  getAttachments: async (filters = {}, page = 1, limit = 20) => {
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

      const response = await apperClient.fetchRecords(ATTACHMENT_TABLE, params);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching attachments:", error);
      throw error;
    }
  },

  /**
   * Get attachments for a specific project
   */
  getAttachmentsByProject: async (projectId) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        where: [{
          fieldName: 'project',
          operator: 'ExactMatch',
          values: [projectId]
        }]
      };

      const response = await apperClient.fetchRecords(ATTACHMENT_TABLE, params);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching attachments for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new attachment
   */
  createAttachment: async (attachmentData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Filter to only include updateable fields
      const filteredData = Object.keys(attachmentData)
        .filter(key => updateableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = attachmentData[key];
          return obj;
        }, {});

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(ATTACHMENT_TABLE, params);
      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error("Error creating attachment:", error);
      throw error;
    }
  },

  /**
   * Delete an attachment
   */
  deleteAttachment: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord(ATTACHMENT_TABLE, params);
      return response.success || false;
    } catch (error) {
      console.error(`Error deleting attachment with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Upload an attachment file (mock implementation)
   * In a real application, you would upload the file to a storage service
   * and then save the URL in the attachment record
   */
  uploadAttachment: async (file, projectId) => {
    try {
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, upload the file to a storage service
      // and get back a URL
      
      // Create a fake URL for demonstration purposes
      const url = URL.createObjectURL(file);
      
      // Create attachment record
      const attachmentData = {
        Name: file.name,
        type: file.type,
        size: file.size,
        url: url,
        project: projectId
      };
      
      return await attachmentService.createAttachment(attachmentData);
    } catch (error) {
      console.error("Error uploading attachment:", error);
      throw error;
    }
  }
};

export default attachmentService;