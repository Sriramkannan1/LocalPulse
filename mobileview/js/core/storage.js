const StorageKeys = {
  USERS: 'localpulse_users',
  ISSUES: 'localpulse_issues',
  EVENTS: 'localpulse_events',
  PROVIDERS: 'localpulse_providers',
  ASSIGNMENTS: 'localpulse_assignments',
  SESSION: 'localpulse_session',
  NOTIFICATIONS: 'localpulse_notifications'
};

class Storage {
  static _get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  static _set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // --- Auth & Users ---
  static getUsers() {
    return this._get(StorageKeys.USERS) || [];
  }

  static getCurrentUser() {
    return this._get(StorageKeys.SESSION);
  }

  static loginAsAdmin(email, password) {
    if (email === 'admin@localpulse.com' && password === 'admin@1234') {
      const sessionUser = { id: 'admin_1', name: 'Admin', email: email, role: 'admin' };
      this._set(StorageKeys.SESSION, sessionUser);
      return sessionUser;
    }
    return null;
  }

  static login(email, password) {
    // Member login accepts ANY email and password.
    // Extract username from email
    let name = email.split('@')[0];
    name = name.charAt(0).toUpperCase() + name.slice(1);
    
    const sessionUser = {
      id: 'mock_' + Date.now(),
      name: name,
      email: email,
      role: 'user',
      location: 'Coimbatore',
      reports: Math.floor(Math.random() * 20),
      reputation: Math.floor(Math.random() * 500) + 50
    };
    
    this._set(StorageKeys.SESSION, sessionUser);
    return sessionUser;
  }

  static logout() {
    localStorage.removeItem(StorageKeys.SESSION);
  }

  static register(name, email, password, role = 'user') {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role
    };
    users.push(newUser);
    this._set(StorageKeys.USERS, users);
    return newUser;
  }

  // --- Issues ---
  static getIssues() {
    return this._get(StorageKeys.ISSUES) || [];
  }

  static saveIssue(issueData) {
    const issues = this.getIssues();
    const newIssue = {
      ...issueData,
      id: issueData.id || Date.now().toString(),
      createdAt: issueData.createdAt || new Date().toISOString(),
      upvotes: issueData.upvotes || 0,
      status: issueData.status || 'Pending'
    };
    issues.push(newIssue);
    this._set(StorageKeys.ISSUES, issues);
    
    // Auto-generate notification
    this.saveNotification({
      type: 'issue',
      title: 'New Citizen Report',
      message: `${newIssue.title || 'New Issue'} reported in ${newIssue.location || 'your area'}`
    });
    
    return newIssue;
  }

  static updateIssue(updatedIssue) {
    const issues = this.getIssues();
    const index = issues.findIndex(i => i.id === updatedIssue.id);
    if (index !== -1) {
      issues[index] = { ...issues[index], ...updatedIssue };
      this._set(StorageKeys.ISSUES, issues);
      return issues[index];
    }
    return null;
  }

  static updateIssueStatus(id, newStatus) {
    const issues = this.getIssues();
    const issue = issues.find(i => i.id === id);
    if (issue) {
      issue.status = newStatus;
      this._set(StorageKeys.ISSUES, issues);

      if (newStatus === 'In Progress') {
        this.saveNotification({ type: 'provider', title: 'Work Started', message: `Work started on Issue #${id}` });
      } else if (newStatus === 'Resolved' || newStatus === 'Closed') {
        this.saveNotification({ type: 'issue', title: 'Issue Resolved', message: `Issue #${id} has been resolved` });
      }

      return true;
    }
    return false;
  }

  static deleteIssue(id) {
    const issues = this.getIssues();
    const filtered = issues.filter(i => i.id !== id);
    this._set(StorageKeys.ISSUES, filtered);
  }

  // --- Events ---
  static getEvents() {
    return this._get(StorageKeys.EVENTS) || [];
  }

  static saveEvent(eventData) {
    const events = this.getEvents();
    const newEvent = {
      ...eventData,
      id: eventData.id || Date.now().toString()
    };
    events.push(newEvent);
    this._set(StorageKeys.EVENTS, events);

    this.saveNotification({
      type: 'system',
      title: 'New Event Created',
      message: `${newEvent.title || 'Event'} has been created`
    });

    return newEvent;
  }

  static updateEvent(updatedEvent) {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
      events[index] = { ...events[index], ...updatedEvent };
      this._set(StorageKeys.EVENTS, events);
      return events[index];
    }
    return null;
  }

  static deleteEvent(id) {
    const events = this.getEvents();
    const filtered = events.filter(e => e.id !== id);
    this._set(StorageKeys.EVENTS, filtered);
  }

  // --- Providers ---
  static getProviders() {
    return this._get(StorageKeys.PROVIDERS) || [];
  }

  static saveProvider(providerData) {
    const providers = this.getProviders();
    const newProvider = {
      ...providerData,
      id: providerData.id || Date.now().toString()
    };
    providers.push(newProvider);
    this._set(StorageKeys.PROVIDERS, providers);

    this.saveNotification({
      type: 'system',
      title: 'Provider Added',
      message: `${newProvider.name} joined as a provider`
    });

    return newProvider;
  }

  static updateProvider(updatedProvider) {
    const providers = this.getProviders();
    const index = providers.findIndex(p => p.id === updatedProvider.id);
    if (index !== -1) {
      providers[index] = { ...providers[index], ...updatedProvider };
      this._set(StorageKeys.PROVIDERS, providers);
      return providers[index];
    }
    return null;
  }

  static deleteProvider(id) {
    const providers = this.getProviders();
    const filtered = providers.filter(p => p.id !== id);
    this._set(StorageKeys.PROVIDERS, filtered);
  }

  // --- Assignments ---
  static getAssignments() {
    return this._get(StorageKeys.ASSIGNMENTS) || [];
  }

  static createAssignment(assignmentData) {
    const assignments = this.getAssignments();
    const newAssignment = {
      ...assignmentData,
      id: assignmentData.id || `ASG_${Date.now()}`,
      assignedAt: assignmentData.assignedAt || new Date().toISOString()
    };
    assignments.push(newAssignment);
    this._set(StorageKeys.ASSIGNMENTS, assignments);
    return newAssignment;
  }

  static saveAssignment(assignmentData) {
    return this.createAssignment(assignmentData); // Legacy compatibility
  }

  static updateAssignment(updatedAssignment) {
    const assignments = this.getAssignments();
    const index = assignments.findIndex(a => a.id === updatedAssignment.id);
    if (index !== -1) {
      assignments[index] = { ...assignments[index], ...updatedAssignment };
      this._set(StorageKeys.ASSIGNMENTS, assignments);
      return assignments[index];
    }
    return null;
  }

  static getProviderTasks(providerId) {
    const issues = this.getIssues();
    // A task belongs to a provider if the issue has their ID assigned
    return issues.filter(i => i.assignedProviderId === providerId);
  }

  static getProviderMetrics(providerId) {
    const tasks = this.getProviderTasks(providerId);
    const assigned = tasks.length;
    const resolved = tasks.filter(t => t.status === 'Resolved' || t.status === 'Closed' || t.providerResponse === 'Completed').length;
    const rejected = tasks.filter(t => t.providerResponse === 'Rejected').length;
    
    let acceptanceRate = 0;
    if (assigned > 0) {
      acceptanceRate = Math.round(((assigned - rejected) / assigned) * 100);
    }

    return {
      assigned,
      resolved,
      rejected,
      acceptanceRate
    };
  }

  static reassignProvider(issueId, newProviderId) {
    const issue = this.getIssues().find(i => i.id === issueId);
    const newProvider = this.getProviders().find(p => p.id === newProviderId);
    
    if (issue && newProvider) {
      // Create a new assignment record
      this.createAssignment({
        issueId: issue.id,
        providerId: newProvider.id,
        providerName: newProvider.name,
        assignedBy: 'system',
        status: 'Pending'
      });

      // Update Issue
      issue.assignedProviderId = newProvider.id;
      issue.assignedProviderName = newProvider.name;
      issue.providerResponse = 'Pending';
      issue.status = 'Assigned';
      issue.assignedAt = new Date().toISOString();
      this.updateIssue(issue);

      // Increment new provider workload
      newProvider.assignedIssues = (newProvider.assignedIssues || 0) + 1;
      this.updateProvider(newProvider);

      this.saveNotification({
        type: 'provider',
        title: 'Provider Assigned',
        message: `${newProvider.name} was assigned to Issue #${issue.id}`
      });
      
      return true;
    }
    return false;
  }
  // --- Notifications ---
  static getNotifications() {
    return this._get(StorageKeys.NOTIFICATIONS) || [];
  }

  static saveNotification(notificationData) {
    const notifications = this.getNotifications();
    const newNotif = {
      ...notificationData,
      id: notificationData.id || `NOT_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      timestamp: notificationData.timestamp || new Date().toISOString(),
      read: notificationData.read || false
    };
    notifications.unshift(newNotif); // Keep newest at top
    this._set(StorageKeys.NOTIFICATIONS, notifications);
    return newNotif;
  }

  static markNotificationRead(id) {
    const notifications = this.getNotifications();
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read) {
      notif.read = true;
      this._set(StorageKeys.NOTIFICATIONS, notifications);
    }
  }

  static markAllNotificationsRead() {
    const notifications = this.getNotifications();
    notifications.forEach(n => n.read = true);
    this._set(StorageKeys.NOTIFICATIONS, notifications);
  }

  static deleteNotification(id) {
    const notifications = this.getNotifications();
    const filtered = notifications.filter(n => n.id !== id);
    this._set(StorageKeys.NOTIFICATIONS, filtered);
  }
}

// Export for module usage, or attach to window for global script usage
window.Storage = Storage;
