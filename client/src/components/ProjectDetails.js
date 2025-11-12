import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Edit2, Trash2, ExternalLink, FileText, Eye } from 'lucide-react';
import axios from '../config/axios';
import './ProjectDetails.css';

const ProjectDetails = ({ project, onClose, onRefresh, userRole }) => {
  const [vendors, setVendors] = useState([]);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingVendor, setViewingVendor] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    entryType: 'vendor',
    vendorName: '',
    agencyName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    quote: '',
    notes: '',
    status: 'pending',
    documentLinks: []
  });
  const [newDocLink, setNewDocLink] = useState({ name: '', url: '' });

  const fetchVendors = useCallback(async () => {
    try {
      const res = await axios.get(`/api/project-vendors/project/${project._id}`);
      console.log('Fetched vendors data:', res.data);
      // Debug: Log document links for each vendor
      res.data.forEach((vendor, idx) => {
        console.log(`Vendor ${idx} documentLinks:`, vendor.documentLinks);
      });
      setVendors(res.data);
    } catch (err) {
      console.error('Failed to fetch vendors');
    }
  }, [project._id]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleAddVendor = () => {
    setEditingVendor(null);
    setVendorForm({
      entryType: 'vendor',
      vendorName: '',
      agencyName: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      quote: '',
      notes: '',
      status: 'pending',
      documentLinks: []
    });
    setShowVendorModal(true);
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setVendorForm({
      entryType: vendor.entryType || 'vendor',
      vendorName: vendor.vendorName || '',
      agencyName: vendor.agencyName || '',
      contactPerson: vendor.contactPerson || '',
      contactEmail: vendor.contactEmail || '',
      contactPhone: vendor.contactPhone || '',
      quote: vendor.quote || '',
      notes: vendor.notes || '',
      status: vendor.status,
      documentLinks: vendor.documentLinks || []
    });
    setShowVendorModal(true);
  };

  const handleSubmitVendor = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await axios.put(`/api/project-vendors/${editingVendor._id}`, vendorForm);
      } else {
        await axios.post('/api/project-vendors', {
          ...vendorForm,
          project: project._id
        });
      }
      setShowVendorModal(false);
      fetchVendors();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to save vendor');
    }
  };

  const handleViewVendor = (vendor) => {
    setViewingVendor(vendor);
    setShowViewModal(true);
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) return;
    try {
      const response = await axios.delete(`/api/project-vendors/${vendorId}`);
      console.log('Delete response:', response);
      alert('Entry deleted successfully!');
      fetchVendors();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete entry';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleAddDocLink = () => {
    if (newDocLink.name && newDocLink.url) {
      setVendorForm({
        ...vendorForm,
        documentLinks: [...vendorForm.documentLinks, { ...newDocLink }]
      });
      setNewDocLink({ name: '', url: '' });
    }
  };

  const handleRemoveDocLink = (index) => {
    setVendorForm({
      ...vendorForm,
      documentLinks: vendorForm.documentLinks.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      approved: '#10b981',
      rejected: '#ef4444',
      'in-discussion': '#3b82f6'
    };
    return colors[status] || '#666';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal project-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{project.name}</h2>
            <p className="project-description">{project.description}</p>
            <span className="status-badge" style={{ background: project.status === 'active' ? '#10b981' : '#fbbf24' }}>
              {project.status}
            </span>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="vendors-section">
          <div className="section-header">
            <h3>Project Resources ({vendors.length})</h3>
            <button onClick={handleAddVendor} className="add-btn-small">
              <Plus size={18} /> Add Entry
            </button>
          </div>

          {vendors.length === 0 ? (
            <p className="no-data">No entries added yet. Click "Add Entry" to add vendors, agencies, or documents.</p>
          ) : (
            <div className="vendors-list">
              {vendors.map(vendor => (
                <div key={vendor._id} className="vendor-card">
                  <div className="vendor-header">
                    <div>
                      <h4>
                        {vendor.vendorName || vendor.agencyName || 'Document Entry'}
                        <span className="entry-type-badge">{vendor.entryType || 'vendor'}</span>
                      </h4>
                      {vendor.vendorName && vendor.agencyName && (
                        <p className="agency-name">{vendor.agencyName}</p>
                      )}
                    </div>
                    <div className="vendor-actions">
                      <button 
                        onClick={() => handleViewVendor(vendor)} 
                        className="icon-btn view"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditVendor(vendor)} 
                        className="icon-btn edit"
                        title="Edit Entry"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteVendor(vendor._id)} 
                        className="icon-btn delete"
                        title="Delete Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="vendor-details">
                    {vendor.quote && (
                      <div className="detail-item">
                        <strong>Quote:</strong> ₹{vendor.quote.toLocaleString('en-IN')}
                      </div>
                    )}
                    {vendor.contactPerson && (
                      <div className="detail-item">
                        <strong>Contact:</strong> {vendor.contactPerson}
                      </div>
                    )}
                    {vendor.contactEmail && (
                      <div className="detail-item">
                        <strong>Email:</strong> {vendor.contactEmail}
                      </div>
                    )}
                    {vendor.contactPhone && (
                      <div className="detail-item">
                        <strong>Phone:</strong> {vendor.contactPhone}
                      </div>
                    )}
                    {vendor.notes && (
                      <div className="detail-item notes">
                        <strong>Notes:</strong> {vendor.notes}
                      </div>
                    )}
                    <div className="detail-item">
                      <strong>Status:</strong>
                      <span className="status-badge-small" style={{ background: getStatusColor(vendor.status) }}>
                        {vendor.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Added by:</strong> {vendor.addedBy?.name}
                    </div>
                  </div>

                  {vendor.documentLinks && vendor.documentLinks.length > 0 && (
                    <div className="document-links">
                      <strong>Documents ({vendor.documentLinks.length}):</strong>
                      <div className="links-list">
                        {vendor.documentLinks.map((doc, idx) => (
                          <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-link">
                            <FileText size={14} />
                            {doc.name}
                            <ExternalLink size={12} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Show if no document links */}
                  {(!vendor.documentLinks || vendor.documentLinks.length === 0) && (
                    <div className="document-links-empty">
                      <small style={{ color: '#999', fontStyle: 'italic' }}>No documents attached</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showVendorModal && (
          <div className="modal-overlay" onClick={() => setShowVendorModal(false)}>
            <div className="modal vendor-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingVendor ? 'Edit Entry' : 'Add Entry'}</h2>
              <form onSubmit={handleSubmitVendor}>
                <div className="form-group">
                  <label>Entry Type</label>
                  <select
                    value={vendorForm.entryType}
                    onChange={(e) => setVendorForm({ ...vendorForm, entryType: e.target.value })}
                  >
                    <option value="vendor">Vendor</option>
                    <option value="agency">Agency</option>
                    <option value="inhouse">In-house Research</option>
                    <option value="document">Document/Resource</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Vendor Name {vendorForm.entryType === 'vendor' && '*'}</label>
                    <input
                      type="text"
                      value={vendorForm.vendorName}
                      onChange={(e) => setVendorForm({ ...vendorForm, vendorName: e.target.value })}
                      placeholder="Enter vendor or person name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Agency Name</label>
                    <input
                      type="text"
                      value={vendorForm.agencyName}
                      onChange={(e) => setVendorForm({ ...vendorForm, agencyName: e.target.value })}
                      placeholder="Enter agency or company name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Person</label>
                    <input
                      type="text"
                      value={vendorForm.contactPerson}
                      onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      value={vendorForm.contactEmail}
                      onChange={(e) => setVendorForm({ ...vendorForm, contactEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      value={vendorForm.contactPhone}
                      onChange={(e) => setVendorForm({ ...vendorForm, contactPhone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Quote (INR)</label>
                    <div className="quote-input-inr">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="number"
                        value={vendorForm.quote}
                        onChange={(e) => setVendorForm({ ...vendorForm, quote: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={vendorForm.status}
                    onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-discussion">In Discussion</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={vendorForm.notes}
                    onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                    rows="3"
                    placeholder="Additional notes or comments..."
                  />
                </div>

                <div className="form-group">
                  <label>Document Links</label>
                  <div className="doc-links-input">
                    <input
                      type="text"
                      placeholder="Document name"
                      value={newDocLink.name}
                      onChange={(e) => setNewDocLink({ ...newDocLink, name: e.target.value })}
                    />
                    <input
                      type="url"
                      placeholder="Document URL"
                      value={newDocLink.url}
                      onChange={(e) => setNewDocLink({ ...newDocLink, url: e.target.value })}
                    />
                    <button type="button" onClick={handleAddDocLink} className="add-link-btn">
                      <Plus size={18} />
                    </button>
                  </div>
                  {vendorForm.documentLinks.length > 0 && (
                    <div className="added-links">
                      {vendorForm.documentLinks.map((doc, idx) => (
                        <div key={idx} className="link-item">
                          <FileText size={14} />
                          <span>{doc.name}</span>
                          <button type="button" onClick={() => handleRemoveDocLink(idx)} className="remove-link-btn">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowVendorModal(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingVendor ? 'Update' : 'Add'} Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showViewModal && viewingVendor && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal view-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Entry Details</h2>
                <button onClick={() => setShowViewModal(false)} className="close-btn">
                  <X size={24} />
                </button>
              </div>
              
              <div className="view-content">
                <div className="view-section">
                  <h3>
                    {viewingVendor.vendorName || viewingVendor.agencyName || 'Document Entry'}
                    <span className="entry-type-badge">{viewingVendor.entryType || 'vendor'}</span>
                  </h3>
                  
                  <div className="view-grid">
                    <div className="view-item">
                      <label>Entry Type:</label>
                      <span className="capitalize">{viewingVendor.entryType || 'vendor'}</span>
                    </div>
                    
                    {viewingVendor.vendorName && (
                      <div className="view-item">
                        <label>Vendor Name:</label>
                        <span>{viewingVendor.vendorName}</span>
                      </div>
                    )}
                    
                    {viewingVendor.agencyName && (
                      <div className="view-item">
                        <label>Agency Name:</label>
                        <span>{viewingVendor.agencyName}</span>
                      </div>
                    )}
                    
                    {viewingVendor.contactPerson && (
                      <div className="view-item">
                        <label>Contact Person:</label>
                        <span>{viewingVendor.contactPerson}</span>
                      </div>
                    )}
                    
                    {viewingVendor.contactEmail && (
                      <div className="view-item">
                        <label>Contact Email:</label>
                        <span>
                          <a href={`mailto:${viewingVendor.contactEmail}`} className="contact-link">
                            {viewingVendor.contactEmail}
                          </a>
                        </span>
                      </div>
                    )}
                    
                    {viewingVendor.contactPhone && (
                      <div className="view-item">
                        <label>Contact Phone:</label>
                        <span>
                          <a href={`tel:${viewingVendor.contactPhone}`} className="contact-link">
                            {viewingVendor.contactPhone}
                          </a>
                        </span>
                      </div>
                    )}
                    
                    {viewingVendor.quote && (
                      <div className="view-item">
                        <label>Quote:</label>
                        <span className="quote-amount">₹{viewingVendor.quote.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    
                    <div className="view-item">
                      <label>Status:</label>
                      <span className="status-badge-small" style={{ background: getStatusColor(viewingVendor.status) }}>
                        {viewingVendor.status}
                      </span>
                    </div>
                    
                    <div className="view-item">
                      <label>Added by:</label>
                      <span>{viewingVendor.addedBy?.name}</span>
                    </div>
                    
                    <div className="view-item">
                      <label>Added on:</label>
                      <span>{new Date(viewingVendor.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                  
                  {viewingVendor.notes && (
                    <div className="view-section">
                      <label>Notes:</label>
                      <div className="notes-content">{viewingVendor.notes}</div>
                    </div>
                  )}
                  
                  {/* Debug: Always show document section to see what's happening */}
                  <div className="view-section">
                    <label>Documents:</label>
                    {console.log('ViewingVendor documentLinks:', viewingVendor.documentLinks)}
                    {viewingVendor.documentLinks && viewingVendor.documentLinks.length > 0 ? (
                      <div className="document-links-view">
                        {viewingVendor.documentLinks.map((doc, idx) => (
                          <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-link-view">
                            <FileText size={16} />
                            <span>{doc.name}</span>
                            <ExternalLink size={14} />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="no-documents">
                        <p style={{ color: '#666', fontStyle: 'italic' }}>
                          No documents attached to this entry.
                        </p>
                        {/* Debug info */}
                        <small style={{ color: '#999', fontSize: '11px' }}>
                          Debug: documentLinks = {JSON.stringify(viewingVendor.documentLinks)}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button onClick={() => setShowViewModal(false)} className="cancel-btn">
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditVendor(viewingVendor);
                  }} 
                  className="submit-btn"
                >
                  Edit Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
