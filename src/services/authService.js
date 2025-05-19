/**
 * Authentication Service
 * Handles user authentication operations using ApperUI and ApperClient
 */
const authService = {
  /**
   * Get the current user profile
   */
  getCurrentUser: async () => {
    try {
      const { ApperUI } = window.ApperSDK;
      return ApperUI.getCurrentUser();
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  /**
   * Log out the current user
   */
  logout: async () => {
    try {
      const { ApperUI } = window.ApperSDK;
      await ApperUI.logout();
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  }
};

export default authService;