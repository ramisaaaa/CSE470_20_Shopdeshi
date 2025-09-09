import React, { useState, useEffect } from 'react';
import './Complaints.css';

const ComplaintsManager = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/complaints');
      const data = await response.json();
      
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4000/api/complaint/${complaintId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchComplaints(); // Refresh list
        alert(`Complaint ${newStatus} successfully!`);
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Failed to update complaint status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#ff9800';
      case 'resolved': return '#4caf50';
      case 'escalated': return '#f44336';
      case 'closed': return '#9e9e9e';
      default: return '#666';
    }
  };

  return (
    <div className="complaints-manager">
      <div className="complaints-header">
        <h1>Customer Complaints Management</h1>
        <div className="complaints-stats">
          <div className="stat-box">
            <span className="stat-number">{complaints.length}</span>
            <span className="stat-label">Total Complaints</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{complaints.filter(c => c.status === 'open').length}</span>
            <span className="stat-label">Open</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{complaints.filter(c => c.status === 'resolved').length}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      <div className="complaints-controls">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All ({complaints.length})
          </button>
          <button 
            className={filter === 'open' ? 'active' : ''} 
            onClick={() => setFilter('open')}
          >
            Open ({complaints.filter(c => c.status === 'open').length})
          </button>
          <button 
            className={filter === 'escalated' ? 'active' : ''} 
            onClick={() => setFilter('escalated')}
          >
            Escalated ({complaints.filter(c => c.status === 'escalated').length})
          </button>
          <button 
            className={filter === 'resolved' ? 'active' : ''} 
            onClick={() => setFilter('resolved')}
          >
            Resolved ({complaints.filter(c => c.status === 'resolved').length})
          </button>
        </div>
        <button className="refresh-btn" onClick={fetchComplaints}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading complaints...</div>
      ) : (
        <div className="complaints-list">
          {filteredComplaints.length === 0 ? (
            <div className="no-complaints">
              <h3>No complaints found</h3>
              <p>No {filter === 'all' ? '' : filter} complaints at the moment.</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div key={complaint._id} className="complaint-card">
                <div className="complaint-header">
                  <div className="complaint-info">
                    <h3>Complaint #{complaint.complaintId}</h3>
                    <p className="order-info">Order: {complaint.orderId}</p>
                    <p className="buyer-info">
                      Buyer: {complaint.buyerId?.email || 'Unknown'}
                    </p>
                    <p className="date-info">
                      Created: {formatDate(complaint.createdAt)}
                    </p>
                  </div>
                  <div className="complaint-status">
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(complaint.status) }}
                    >
                      {complaint.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="complaint-content">
                  <div className="original-message">
                    <h4>Original Complaint:</h4>
                    <p>{complaint.message}</p>
                  </div>

                  {complaint.thread && complaint.thread.length > 1 && (
                    <div className="conversation-thread">
                      <h4>Conversation:</h4>
                      <div className="thread-messages">
                        {complaint.thread.map((msg, index) => (
                          <div key={index} className={`thread-message ${msg.from}`}>
                            <div className="message-header">
                              <span className="sender">{msg.from.toUpperCase()}</span>
                              <span className="timestamp">{formatDate(msg.timestamp)}</span>
                            </div>
                            <div className="message-content">{msg.message}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="complaint-actions">
                  {complaint.status === 'open' && (
                    <>
                      <button 
                        className="action-btn resolve-btn"
                        onClick={() => updateComplaintStatus(complaint._id, 'resolved')}
                      >
                        ✅ Mark Resolved
                      </button>
                      <button 
                        className="action-btn escalate-btn"
                        onClick={() => updateComplaintStatus(complaint._id, 'escalated')}
                      >
                        ⚠️ Escalate
                      </button>
                    </>
                  )}
                  {complaint.status === 'escalated' && (
                    <>
                      <button 
                        className="action-btn resolve-btn"
                        onClick={() => updateComplaintStatus(complaint._id, 'resolved')}
                      >
                        ✅ Mark Resolved
                      </button>
                      <button 
                        className="action-btn close-btn"
                        onClick={() => updateComplaintStatus(complaint._id, 'closed')}
                      >
                        🔒 Close
                      </button>
                    </>
                  )}
                  {complaint.status === 'resolved' && (
                    <button 
                      className="action-btn close-btn"
                      onClick={() => updateComplaintStatus(complaint._id, 'closed')}
                    >
                      🔒 Close
                    </button>
                  )}
                  {complaint.status === 'closed' && (
                    <span className="status-text">✅ Complaint Closed</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ComplaintsManager;