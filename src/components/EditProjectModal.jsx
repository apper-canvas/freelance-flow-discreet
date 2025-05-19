import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';

// Import icons
const XIcon = getIcon('x');
const CheckIcon = getIcon('check-circle');

const EditProjectModal = ({ isOpen, onClose, project, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    client: ''
  });
  
  const [errors, setErrors] = useState({
    name: false,
    client: false
  });

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        id: project.id,
        name: project.name,
        client: project.client
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when user types
    if (value.trim()) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {
      name: !formData.name.trim(),
      client: !formData.client.trim()
    };
    
    setErrors(newErrors);
    
    // If there are no errors, save the project
    if (!newErrors.name && !newErrors.client) {
      onSave(formData);
      onClose();
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-surface-800 rounded-xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Edit Project</h2>
              <button 
                onClick={onClose} 
                className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="label">Project Name*</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter project name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">Project name is required</p>}
                </div>
                
                <div>
                  <label htmlFor="client" className="label">Client*</label>
                  <input
                    id="client"
                    name="client"
                    type="text"
                    value={formData.client}
                    onChange={handleChange}
                    className={`input ${errors.client ? 'border-red-500' : ''}`}
                    placeholder="Enter client name"
                  />
                  {errors.client && <p className="text-red-500 text-sm mt-1">Client name is required</p>}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProjectModal;