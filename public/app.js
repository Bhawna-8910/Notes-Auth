/**
 * NotesFlow - Frontend Application Logic
 */

// Application State
const state = {
  token: localStorage.getItem('notes_auth_token') || null,
  user: JSON.parse(localStorage.getItem('notes_auth_user') || 'null'),
  notes: [],
  filteredNotes: [],
  activeTab: 'login', // 'login' | 'register'
  theme: localStorage.getItem('notes_theme') || 'dark',
  noteToDelete: null
};

// DOM Elements
const elements = {
  // Theme
  themeToggleBtn: document.getElementById('themeToggleBtn'),

  // Header User
  userProfile: document.getElementById('userProfile'),
  userAvatar: document.getElementById('userAvatar'),
  userEmailDisplay: document.getElementById('userEmailDisplay'),
  logoutBtn: document.getElementById('logoutBtn'),

  // Sections
  authSection: document.getElementById('authSection'),
  dashboardSection: document.getElementById('dashboardSection'),

  // Auth Form
  authTitle: document.getElementById('authTitle'),
  authSubtitle: document.getElementById('authSubtitle'),
  tabLogin: document.getElementById('tabLogin'),
  tabRegister: document.getElementById('tabRegister'),
  authForm: document.getElementById('authForm'),
  authEmail: document.getElementById('authEmail'),
  authPassword: document.getElementById('authPassword'),
  authSubmitBtn: document.getElementById('authSubmitBtn'),
  authSpinner: document.getElementById('authSpinner'),
  authSwitchPrompt: document.getElementById('authSwitchPrompt'),
  authSwitchLink: document.getElementById('authSwitchLink'),
  togglePasswordBtn: document.getElementById('togglePasswordBtn'),

  // Dashboard Toolbar & Stats
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  sortSelect: document.getElementById('sortSelect'),
  openCreateModalBtn: document.getElementById('openCreateModalBtn'),
  totalNotesCount: document.getElementById('totalNotesCount'),
  filteredCountPill: document.getElementById('filteredCountPill'),
  filteredNotesCount: document.getElementById('filteredNotesCount'),
  notesGrid: document.getElementById('notesGrid'),
  emptyState: document.getElementById('emptyState'),
  emptyTitle: document.getElementById('emptyTitle'),
  emptySubtitle: document.getElementById('emptySubtitle'),
  emptyCreateBtn: document.getElementById('emptyCreateBtn'),

  // Note Modal
  noteModal: document.getElementById('noteModal'),
  modalTitle: document.getElementById('modalTitle'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelNoteBtn: document.getElementById('cancelNoteBtn'),
  noteForm: document.getElementById('noteForm'),
  editNoteId: document.getElementById('editNoteId'),
  noteTitleInput: document.getElementById('noteTitleInput'),
  noteContentInput: document.getElementById('noteContentInput'),
  titleCharCount: document.getElementById('titleCharCount'),
  contentCharCount: document.getElementById('contentCharCount'),
  saveNoteBtn: document.getElementById('saveNoteBtn'),
  noteSpinner: document.getElementById('noteSpinner'),

  // Delete Modal
  deleteModal: document.getElementById('deleteModal'),
  deleteNoteTitleDisplay: document.getElementById('deleteNoteTitleDisplay'),
  closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================
// Initialization
// ==========================================
function init() {
  // Apply saved theme
  applyTheme(state.theme);

  // Check login state
  if (state.token && state.user) {
    showDashboard();
    fetchNotes();
  } else {
    showAuth();
  }

  setupEventListeners();
}

// ==========================================
// Theme Management
// ==========================================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.theme = theme;
  localStorage.setItem('notes_theme', theme);
}

function toggleTheme() {
  const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
}

// ==========================================
// Toast Notification System
// ==========================================
function showToast(message, type = 'info', duration = 3500) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : type === 'error'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <span>${escapeHtml(message)}</span>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-closing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ==========================================
// API Request Helper
// ==========================================
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json();

    if (response.status === 401 && state.token) {
      // Token expired or invalid
      showToast('Session expired. Please sign in again.', 'error');
      logout();
      return null;
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==========================================
// Auth Handling
// ==========================================
function switchAuthTab(tab) {
  state.activeTab = tab;
  const isLogin = tab === 'login';

  elements.tabLogin.classList.toggle('active', isLogin);
  elements.tabLogin.setAttribute('aria-selected', isLogin);

  elements.tabRegister.classList.toggle('active', !isLogin);
  elements.tabRegister.setAttribute('aria-selected', !isLogin);

  elements.authTitle.textContent = isLogin ? 'Welcome Back' : 'Create an Account';
  elements.authSubtitle.textContent = isLogin 
    ? 'Access your private and encrypted notes anytime' 
    : 'Join NotesFlow to keep your notes organized and safe';

  elements.authSubmitBtn.querySelector('.btn-text').textContent = isLogin ? 'Sign In' : 'Create Account';

  elements.authSwitchPrompt.innerHTML = isLogin
    ? `Don't have an account? <a href="#" id="authSwitchLink">Create one now</a>`
    : `Already have an account? <a href="#" id="authSwitchLink">Sign in here</a>`;

  document.getElementById('authSwitchLink').addEventListener('click', (e) => {
    e.preventDefault();
    switchAuthTab(isLogin ? 'register' : 'login');
  });
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;

  if (!email || !password) {
    showToast('Please fill in both email and password', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters long', 'error');
    return;
  }

  // Show spinner
  elements.authSubmitBtn.disabled = true;
  elements.authSpinner.classList.remove('hidden');

  try {
    const endpoint = state.activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const result = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (result && result.token) {
      state.token = result.token;
      state.user = result.user;

      localStorage.setItem('notes_auth_token', result.token);
      localStorage.setItem('notes_auth_user', JSON.stringify(result.user));

      showToast(state.activeTab === 'login' ? 'Signed in successfully!' : 'Account created successfully!', 'success');
      elements.authForm.reset();
      showDashboard();
      fetchNotes();
    }
  } catch (err) {
    showToast(err.message || 'Authentication failed', 'error');
  } finally {
    elements.authSubmitBtn.disabled = false;
    elements.authSpinner.classList.add('hidden');
  }
}

function logout() {
  state.token = null;
  state.user = null;
  state.notes = [];
  state.filteredNotes = [];

  localStorage.removeItem('notes_auth_token');
  localStorage.removeItem('notes_auth_user');

  showToast('Logged out successfully', 'info');
  showAuth();
}

function showAuth() {
  elements.authSection.classList.remove('hidden');
  elements.dashboardSection.classList.add('hidden');
  elements.userProfile.classList.add('hidden');
  switchAuthTab('login');
}

function showDashboard() {
  elements.authSection.classList.add('hidden');
  elements.dashboardSection.classList.remove('hidden');
  elements.userProfile.classList.remove('hidden');

  if (state.user && state.user.email) {
    elements.userEmailDisplay.textContent = state.user.email;
    elements.userAvatar.textContent = state.user.email.charAt(0).toUpperCase();
  }
}

// ==========================================
// Notes Operations
// ==========================================
async function fetchNotes() {
  try {
    const result = await apiRequest('/api/notes');
    if (result && result.success) {
      state.notes = result.data || [];
      applyFilterAndSort();
    }
  } catch (err) {
    showToast('Failed to load notes: ' + err.message, 'error');
  }
}

function applyFilterAndSort() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const sortMode = elements.sortSelect.value;

  // Filter
  if (!query) {
    state.filteredNotes = [...state.notes];
    elements.filteredCountPill.classList.add('hidden');
    elements.clearSearchBtn.classList.add('hidden');
  } else {
    elements.clearSearchBtn.classList.remove('hidden');
    state.filteredNotes = state.notes.filter(note => 
      (note.title && note.title.toLowerCase().includes(query)) ||
      (note.content && note.content.toLowerCase().includes(query))
    );
    elements.filteredCountPill.classList.remove('hidden');
    elements.filteredNotesCount.textContent = state.filteredNotes.length;
  }

  // Sort
  if (sortMode === 'newest') {
    state.filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortMode === 'oldest') {
    state.filteredNotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortMode === 'title') {
    state.filteredNotes.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  elements.totalNotesCount.textContent = state.notes.length;
  renderNotes();
}

function renderNotes() {
  elements.notesGrid.innerHTML = '';

  if (state.filteredNotes.length === 0) {
    elements.emptyState.classList.remove('hidden');
    if (state.notes.length > 0) {
      elements.emptyTitle.textContent = 'No Matching Notes';
      elements.emptySubtitle.textContent = 'Try adjusting your search terms or clearing the filter.';
      elements.emptyCreateBtn.classList.add('hidden');
    } else {
      elements.emptyTitle.textContent = 'No Notes Yet';
      elements.emptySubtitle.textContent = 'Capture your thoughts, code snippets, or daily plans right here.';
      elements.emptyCreateBtn.classList.remove('hidden');
    }
    return;
  }

  elements.emptyState.classList.add('hidden');

  state.filteredNotes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.setAttribute('data-id', note._id);

    const relativeTime = formatRelativeTime(note.createdAt);
    const fullDate = new Date(note.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    card.innerHTML = `
      <div class="note-card-main">
        <div class="note-header">
          <h3 class="note-title">${escapeHtml(note.title)}</h3>
          <button class="action-icon-btn btn-copy" title="Copy Content" aria-label="Copy note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
        <p class="note-content">${escapeHtml(note.content)}</p>
      </div>

      <div class="note-footer">
        <div class="note-timestamp" title="${fullDate}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>${relativeTime}</span>
        </div>
        <div class="note-actions">
          <button class="action-icon-btn btn-edit" title="Edit Note" aria-label="Edit note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-icon-btn btn-delete" title="Delete Note" aria-label="Delete note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Copy Action
    card.querySelector('.btn-copy').addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard(`${note.title}\n\n${note.content}`);
    });

    // Edit Action
    card.querySelector('.btn-edit').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(note);
    });

    // Delete Action
    card.querySelector('.btn-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      openDeleteModal(note);
    });

    elements.notesGrid.appendChild(card);
  });
}

// ==========================================
// Modal Handlers (Create / Edit)
// ==========================================
function openCreateModal() {
  elements.editNoteId.value = '';
  elements.modalTitle.textContent = 'Create New Note';
  elements.saveNoteBtn.querySelector('.btn-text').textContent = 'Create Note';
  elements.noteForm.reset();
  updateCharCounts();
  elements.noteModal.classList.remove('hidden');
  elements.noteTitleInput.focus();
}

function openEditModal(note) {
  elements.editNoteId.value = note._id;
  elements.modalTitle.textContent = 'Edit Note';
  elements.saveNoteBtn.querySelector('.btn-text').textContent = 'Update Note';
  elements.noteTitleInput.value = note.title;
  elements.noteContentInput.value = note.content;
  updateCharCounts();
  elements.noteModal.classList.remove('hidden');
  elements.noteTitleInput.focus();
}

function closeNoteModal() {
  elements.noteModal.classList.add('hidden');
  elements.noteForm.reset();
}

function updateCharCounts() {
  const titleLen = elements.noteTitleInput.value.length;
  elements.titleCharCount.textContent = `${titleLen}/120`;

  const contentText = elements.noteContentInput.value.trim();
  const words = contentText ? contentText.split(/\s+/).length : 0;
  elements.contentCharCount.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
}

async function handleSaveNote(e) {
  e.preventDefault();
  const id = elements.editNoteId.value;
  const title = elements.noteTitleInput.value.trim();
  const content = elements.noteContentInput.value.trim();

  if (!title || !content) {
    showToast('Please provide both title and content', 'error');
    return;
  }

  elements.saveNoteBtn.disabled = true;
  elements.noteSpinner.classList.remove('hidden');

  try {
    if (id) {
      // Update
      const res = await apiRequest(`/api/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content })
      });
      if (res && res.success) {
        showToast('Note updated successfully!', 'success');
        const idx = state.notes.findIndex(n => n._id === id);
        if (idx !== -1) state.notes[idx] = res.data;
      }
    } else {
      // Create
      const res = await apiRequest('/api/notes', {
        method: 'POST',
        body: JSON.stringify({ title, content })
      });
      if (res && res.success) {
        showToast('Note created successfully!', 'success');
        state.notes.unshift(res.data);
      }
    }

    closeNoteModal();
    applyFilterAndSort();
  } catch (err) {
    showToast(err.message || 'Failed to save note', 'error');
  } finally {
    elements.saveNoteBtn.disabled = false;
    elements.noteSpinner.classList.add('hidden');
  }
}

// ==========================================
// Delete Modal Handlers
// ==========================================
function openDeleteModal(note) {
  state.noteToDelete = note;
  elements.deleteNoteTitleDisplay.textContent = `"${note.title}"`;
  elements.deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  state.noteToDelete = null;
  elements.deleteModal.classList.add('hidden');
}

async function handleConfirmDelete() {
  if (!state.noteToDelete) return;
  const id = state.noteToDelete._id;

  try {
    const res = await apiRequest(`/api/notes/${id}`, { method: 'DELETE' });
    if (res && res.success) {
      showToast('Note deleted', 'info');
      state.notes = state.notes.filter(n => n._id !== id);
      closeDeleteModal();
      applyFilterAndSort();
    }
  } catch (err) {
    showToast('Failed to delete note: ' + err.message, 'error');
  }
}

// ==========================================
// Helper Utilities
// ==========================================
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) {
    const mins = Math.max(1, Math.floor(diffSec / 60));
    return `${mins}m ago`;
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${hours}h ago`;
  }
  const days = Math.floor(diffSec / 86400);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'info', 2000);
  } catch {
    showToast('Failed to copy', 'error');
  }
}

// ==========================================
// Event Listeners Setup
// ==========================================
function setupEventListeners() {
  // Theme Toggle
  elements.themeToggleBtn.addEventListener('click', toggleTheme);

  // Auth Tabs
  elements.tabLogin.addEventListener('click', () => switchAuthTab('login'));
  elements.tabRegister.addEventListener('click', () => switchAuthTab('register'));

  // Auth Form
  elements.authForm.addEventListener('submit', handleAuthSubmit);
  elements.logoutBtn.addEventListener('click', logout);

  // Password Visibility Toggle
  elements.togglePasswordBtn.addEventListener('click', () => {
    const isPassword = elements.authPassword.type === 'password';
    elements.authPassword.type = isPassword ? 'text' : 'password';
    elements.togglePasswordBtn.querySelector('.eye-open').classList.toggle('hidden', isPassword);
    elements.togglePasswordBtn.querySelector('.eye-closed').classList.toggle('hidden', !isPassword);
  });

  // Search & Filter
  elements.searchInput.addEventListener('input', applyFilterAndSort);
  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    applyFilterAndSort();
    elements.searchInput.focus();
  });
  elements.sortSelect.addEventListener('change', applyFilterAndSort);

  // Modal Triggers
  elements.openCreateModalBtn.addEventListener('click', openCreateModal);
  elements.emptyCreateBtn.addEventListener('click', openCreateModal);
  elements.closeModalBtn.addEventListener('click', closeNoteModal);
  elements.cancelNoteBtn.addEventListener('click', closeNoteModal);
  elements.noteForm.addEventListener('submit', handleSaveNote);

  // Char Counts in Note Inputs
  elements.noteTitleInput.addEventListener('input', updateCharCounts);
  elements.noteContentInput.addEventListener('input', updateCharCounts);

  // Delete Modal Triggers
  elements.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  // Close modals when clicking backdrop
  elements.noteModal.addEventListener('click', (e) => {
    if (e.target === elements.noteModal) closeNoteModal();
  });
  elements.deleteModal.addEventListener('click', (e) => {
    if (e.target === elements.deleteModal) closeDeleteModal();
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!elements.noteModal.classList.contains('hidden')) closeNoteModal();
      if (!elements.deleteModal.classList.contains('hidden')) closeDeleteModal();
    }
    // Ctrl+Enter to save note inside modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!elements.noteModal.classList.contains('hidden')) {
        elements.noteForm.requestSubmit();
      }
    }
  });
}

// Run app
document.addEventListener('DOMContentLoaded', init);
