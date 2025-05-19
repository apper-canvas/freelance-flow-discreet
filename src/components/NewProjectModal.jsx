import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';

const XIcon = getIcon('x');

function NewProjectModal({ isOpen, onClose, onAddProject }) {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    description: ''
  });
  
  const [validation, setValidation] = useState({
    name: true,
    client: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user types
    if (name === 'name' || name === 'client') {
      setValidation(prev => ({ ...prev, [name]: !!value.trim() }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form fields
    const isNameValid = !!formData.name.trim();
    const isClientValid = !!formData.client.trim();
    
    setValidation({
      name: isNameValid,
      client: isClientValid
    });
    
    if (isNameValid && isClientValid) {
      // Create new project
      const newProject = {
        id: Date.now(),
        name: formData.name.trim(),
        client: formData.client.trim(),
        description: formData.description.trim()
      };
      
      onAddProject(newProject);
      
      // Reset form and close modal
      setFormData({
        name: '',
        client: '',
        description: ''
      });
      
      toast.success("Project created successfully!");
      onClose();
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-surface-800 rounded-xl shadow-lg w-full max-w-md"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-surface-200 dark:border-surface-700">
              <h2 className="text-xl font-semibold">Create New Project</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label htmlFor="name" className="label">Project Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input ${!validation.name ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholder="e.g., Website Redesign"
                />
                {!validation.name && <p className="mt-1 text-sm text-red-500">Project name is required</p>}
              </div>
              
              <div>
                <label htmlFor="client" className="label">Client Name *</label>
                <input
                  type="text"
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                  className={`input ${!validation.client ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholder="e.g., Acme Corp"
                />
                {!validation.client && <p className="mt-1 text-sm text-red-500">Client name is required</p>}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Create Project</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NewProjectModal;