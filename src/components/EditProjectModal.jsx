import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getIcon } from '../utils/iconUtils';
import projectService from '../services/projectService';
import attachmentService from '../services/attachmentService';

// Import icons
const CheckIcon = getIcon('check-circle');
const XIcon = getIcon('x');

const EditProjectModal = ({ isOpen, onClose, project, onSave }) => {
  const [formData, setFormData] = useState({
    id: project?.id || '',
    name: project?.name || '',
    client: project?.client || '',
    description: project?.description || '',
    startDate: project?.startDate ? new Date(project?.startDate) : null,
    endDate: project?.endDate ? new Date(project?.endDate) : null,
    manager: project?.manager || '',
    teamMembers: project?.teamMembers || [],
    priority: project?.priority || 'medium',
    status: project?.status || 'pending',
    budget: project?.budget || '',
    tags: project?.tags || [],
    attachments: project?.attachments || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [errors, setErrors] = useState({
    name: false,
    client: false,
    startDate: false,
    budget: false,
    manager: false
  });
  
  const [validation, setValidation] = useState({
    name: true,
    client: true,
    startDate: true,
    endDate: true,
    manager: true,
    budget: true
  });

  const [newTag, setNewTag] = useState('');
  const [newTeamMember, setNewTeamMember] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      handleFileChange({ target: { files: acceptedFiles } });
    }
  });

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        id: project.id,
        name: project.name || '',
        client: project.client || '',
        description: project.description || '',
        startDate: project.startDate ? new Date(project.startDate) : null,
        endDate: project.endDate ? new Date(project.endDate) : null,
        manager: project.manager || '',
        teamMembers: project.teamMembers || [],
        priority: project.priority || 'medium',
        status: project.status || 'pending',
        budget: project.budget || '',
        tags: project.tags || [],
        attachments: project.attachments || []
      });
    }
  }, [project]);
  
  // Clean up created object URLs on component unmount
  useEffect(() => {
    return () => {
      if (formData.attachments) {
        formData.attachments.forEach(attachment => {
          if (attachment.url) {
            URL.revokeObjectURL(attachment.url);
          }
        });
      }
    };
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user types
    if (['name', 'client', 'manager', 'budget'].includes(name)) {
      setValidation(prev => ({ ...prev, [name]: !!value.trim() }));
    }
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date }));
    setValidation(prev => ({ ...prev, [field]: date !== null }));
  };
  
  const handleAddTag = () => {
    if (newTag.trim() !== '' && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleAddTeamMember = () => {
    if (newTeamMember.trim() !== '' && !formData.teamMembers.includes(newTeamMember.trim())) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, newTeamMember.trim()]
      }));
      setNewTeamMember('');
    }
  };
  
  const handleRemoveTeamMember = (memberToRemove) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member !== memberToRemove)
    }));
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create URL objects for previews
    const newAttachments = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      file
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };
  
  const handleRemoveAttachment = (attachmentToRemove) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(attachment => 
        attachment.url !== attachmentToRemove.url
      )
    }));
    
    // Revoke object URL to prevent memory leaks
    if (attachmentToRemove.url) {
      URL.revokeObjectURL(attachmentToRemove.url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    const isNameValid = !!formData.name.trim();
    const isClientValid = !!formData.client.trim();
    const isStartDateValid = formData.startDate !== null;
    const isEndDateValid = true; // Optional field
    const isManagerValid = !!formData.manager?.trim();
    const isBudgetValid = !!formData.budget?.toString().trim() && !isNaN(formData.budget);
    
    setValidation({
      name: isNameValid,
      client: isClientValid,
      startDate: isStartDateValid,
      endDate: isEndDateValid,
      manager: isManagerValid,
      budget: isBudgetValid
    });
    
    if (isNameValid && isClientValid && isStartDateValid && isManagerValid && isBudgetValid) {
      try {
        // Format the project data for the API
        const projectData = {
          Name: formData.name,
          client: formData.client,
          description: formData.description,
        setIsSubmitting(true);
          startDate: formData.startDate,
          endDate: formData.endDate,
          manager: formData.manager,
          priority: formData.priority,
          status: formData.status,
          budget: formData.budget,
          Tags: formData.tags ? formData.tags.join(',') : ''
        };
        
        // Update in the database
        await projectService.updateProject(formData.id, projectData);
        
        // Process attachments
        // For simplicity, we'll handle only new attachments here
        const newAttachments = formData.attachments.filter(att => att.file);
        
        if (newAttachments.length > 0) {
          for (const attachment of newAttachments) {
            if (attachment.file) {
              await attachmentService.uploadAttachment(attachment.file, formData.id);
            }
          }
        }
        
        // Pass the updated data back to the parent component
        onSave(formData);
        
        toast.success("Project updated successfully!");
        onClose();
      } catch (error) {
        console.error("Error updating project:", error);
        toast.error("Failed to update project. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error("Please fill in all required fields correctly.");
      setIsSubmitting(false);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const isImageFile = (file) => {
    return file.type?.startsWith('image/');
  };
  
  // Function to render file preview
  const renderFilePreview = (attachment) => {
    if (isImageFile(attachment)) {
      return (
        <div className="relative w-16 h-16 rounded overflow-hidden">
          <img src={attachment.url} alt={attachment.name} className="w-full h-full object-cover" />
        </div>
      );
    } else {
      // For non-image files show an icon
      const FileIcon = getIcon('file');
      return (
        <div className="relative w-16 h-16 flex items-center justify-center bg-surface-100 dark:bg-surface-700 rounded">
          <FileIcon className="w-8 h-8 text-surface-500" />
        </div>
      );
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
               className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
             >
               <XIcon className="h-5 w-5" />
             </button>
           </div>
            
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="max-h-[70vh] overflow-y-auto p-5">
               <h3 className="text-lg font-medium">Basic Information</h3>
               
               <div>
                  <label htmlFor="name" className="label">Project Name*</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                   value={formData.name}
                    onChange={handleInputChange}
                    className={`input ${!validation.name ? 'border-red-500 dark:border-red-500' : ''}`}
                    disabled={isSubmitting}
                    placeholder="Enter project name"
                 />
                 {!validation.name && <p className="mt-1 text-sm text-red-500">Project name is required</p>}
               </div>
               
               <div>
                 <label htmlFor="client" className="label">Client *</label>
                  <input
                    id="client"
                    type="text"
                    name="client"
                   value={formData.client}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`input ${!validation.client ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="Enter client name"
                 />
                 {!validation.client && <p className="mt-1 text-sm text-red-500">Client name is required</p>}
               </div>

               <div>
                 <label htmlFor="description" className="label">Description</label>
                 <textarea
                   id="description"
                   name="description"
                   value={formData.description}
                   onChange={handleInputChange}
                   disabled={isSubmitting}
                   className="input h-24"
                   placeholder="Describe the project scope and objectives..."
                 />
               </div>

               <h3 className="text-lg font-medium mt-6">Timeline & Management</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="label">Start Date *</label>
                   <DatePicker
                     selected={formData.startDate}
                     onChange={(date) => handleDateChange(date, 'startDate')}
                     disabled={isSubmitting}
                     className={`input ${!validation.startDate ? 'border-red-500 dark:border-red-500' : ''}`}
                     placeholderText="Select start date"
                     dateFormat="MMMM d, yyyy"
                   />
                   {!validation.startDate && <p className="mt-1 text-sm text-red-500">Start date is required</p>}
                 </div>
                 
                 <div>
                   <label className="label">End Date</label>
                   <DatePicker
                     selected={formData.endDate}
                     onChange={(date) => handleDateChange(date, 'endDate')}
                     disabled={isSubmitting}
                     className="input"
                     placeholderText="Select end date"
                     dateFormat="MMMM d, yyyy"
                     minDate={formData.startDate}
                   />
                 </div>
               </div>

               <div>
                 <label htmlFor="manager" className="label">Project Manager *</label>
                  <input
                    type="text"
                    id="manager"
                    name="manager"
                    value={formData.manager}
                    disabled={isSubmitting}
                    onChange={handleInputChange}
                    className={`input ${!validation.manager ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="Name of project manager"
                  />
                  {!validation.manager && <p className="mt-1 text-sm text-red-500">Project manager is required</p>}
               </div>

               <div>
                 <label className="label">Team Members</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTeamMember}
                      onChange={(e) => setNewTeamMember(e.target.value)}
                      disabled={isSubmitting}
                      className="input flex-1"
                      placeholder="Add team member"
                    />
                    <button
                      type="button"
                      onClick={handleAddTeamMember}
                      className="btn-primary px-3"
                    >
                      Add
                    </button>
                  </div>
                  {formData.teamMembers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.teamMembers.map((member, index) => (
                        <div 
                          key={index}
                          className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full flex items-center text-sm"
                        >
                          <span>{member}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTeamMember(member)}
                            className="ml-1.5 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                          >
                            <XIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
               <h3 className="text-lg font-medium mt-6">Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className="label">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      disabled={isSubmitting}
                      onChange={handleInputChange}
                      className="input"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="label">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      disabled={isSubmitting}
                      onChange={handleInputChange}
                      className="input"
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="budget" className="label">Budget (USD) *</label>
                  <input
                    type="text"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    disabled={isSubmitting}
                    onChange={handleInputChange}
                    className={`input ${!validation.budget ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="e.g., 5000"
                  />
                  {!validation.budget && <p className="mt-1 text-sm text-red-500">Valid budget amount is required</p>}
                  </div>
                </div>
                
                <div>
                  <label className="label">Tags</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      disabled={isSubmitting}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="input flex-1"
                      placeholder="Add tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="btn-primary px-3"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <div 
                          key={index}
                          className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full flex items-center text-sm"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1.5 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                          >
                            <XIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                   <label className="label">Attachments</label>
                   <input
                     {...getInputProps()}
                     id="file-upload-edit"
                   />
                   <div
                     {...getRootProps()}
                     className="btn-ghost w-full flex justify-center items-center p-3 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg cursor-pointer"
                   >
                     <span>Drag & drop files here, or click to select files</span>
                   </div>
                   
                   {formData.attachments.length > 0 && (
                     <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                       {formData.attachments.map((attachment, index) => (
                         <div key={index} className="relative group">
                           {renderFilePreview(attachment)}
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                             <button type="button" onClick={() => handleRemoveAttachment(attachment)} className="text-white p-1.5 bg-red-500 rounded-full hover:bg-red-600">
                               <XIcon className="h-4 w-4" />
                             </button>
                           </div>
                           <p className="text-xs truncate mt-1">{attachment.name}</p>
                           <p className="text-xs text-surface-500">{attachment.size ? formatFileSize(attachment.size) : ''}</p>
                          </div>
                       ))}
                     </div>
                   )}
                 </div>
              </div>
              
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                  <button type="submit" className={`btn-primary ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`} disabled={isSubmitting}>
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