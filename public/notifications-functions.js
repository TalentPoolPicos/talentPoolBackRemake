// =========================================
// 🔔 FUNÇÕES DE NOTIFICAÇÕES ATUALIZADAS
// =========================================

// Variáveis globais para notificações
let currentPage = 1;
let currentFilter = 'all';
let currentLimit = 20;
let totalPages = 1;
let notificationsData = [];

// Buscar notificações do usuário com paginação e filtros
async function fetchUserNotifications() {
  try {
    const params = new URLSearchParams({
      page: currentPage,
      limit: currentLimit,
      unreadOnly: currentFilter === 'unread' ? 'true' : 'false'
    });

    const response = await fetch(`${API_BASE}/me/notifications?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      notificationsData = data.notifications || [];
      totalPages = Math.ceil(data.pagination.total / currentLimit);
      
      displayNotifications(notificationsData);
      updatePaginationControls();
      updateNotificationStats(data);
      
      showResponse('notificationsResponse', data);
    } else {
      throw new Error('Erro ao buscar notificações');
    }
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    showError('Erro ao carregar notificações');
  }
}

// Marcar notificação como lida
async function markNotificationAsReadById(notificationId) {
  try {
    const response = await fetch(`${API_BASE}/me/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      // Atualizar a notificação na interface
      const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
      if (notificationElement) {
        notificationElement.classList.remove('unread');
        notificationElement.classList.add('read');
      }
      
      // Atualizar contador de não lidas
      fetchUnreadCount();
      
      // Recarregar notificações se estiver filtrando por não lidas
      if (currentFilter === 'unread') {
        fetchUserNotifications();
      }
    } else {
      throw new Error('Erro ao marcar notificação como lida');
    }
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    showError('Erro ao marcar notificação como lida');
  }
}

// Buscar contador de notificações não lidas
async function fetchUnreadCount() {
  try {
    const response = await fetch(`${API_BASE}/me/notifications/unread-count`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      updateUnreadBadge(data.unreadCount);
    }
  } catch (error) {
    console.error('Erro ao buscar contador de não lidas:', error);
  }
}

// Exibir notificações na interface
function displayNotifications(notifications) {
  const container = document.getElementById('notificationsContainer');
  container.innerHTML = '';

  if (notifications.length === 0) {
    container.innerHTML = '<p style="color: #666; text-align: center; margin: 0;">Nenhuma notificação encontrada</p>';
    return;
  }

  notifications.forEach(notification => {
    const notificationElement = createNotificationElement(notification);
    container.appendChild(notificationElement);
  });
}

// Criar elemento de notificação melhorado
function createNotificationElement(notification) {
  const div = document.createElement('div');
  div.className = `notification-item ${notification.isRead ? 'read' : 'unread'}`;
  div.setAttribute('data-notification-id', notification.id);
  
  // Determinar ícone baseado no tipo
  const typeIcons = {
    'welcome_message': '👋',
    'profile_liked': '❤️',
    'profile_viewed': '👁️',
    'job_published': '📢',
    'job_application_received': '📝',
    'job_application_updated': '📋',
    'job_expiring': '⏰',
    'review_notes_added': '📝',
    'system_announcement': '📢',
    'custom': '🔔'
  };
  
  const icon = typeIcons[notification.type] || '🔔';
  const priority = notification.priority || 1;
  const priorityText = priority === 3 ? 'Alta' : priority === 2 ? 'Média' : 'Baixa';
  
  div.innerHTML = `
    <div style="display: flex; justify-between; align-items: start; gap: 12px;">
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="font-size: 18px;">${icon}</span>
          <h4 style="font-weight: 600; color: #1f2937; margin: 0; font-size: 14px;">${notification.title}</h4>
          <span style="background: ${priority === 3 ? '#fef3c7' : priority === 2 ? '#dbeafe' : '#f3f4f6'}; color: ${priority === 3 ? '#f59e0b' : priority === 2 ? '#3b82f6' : '#6b7280'}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;">${priorityText}</span>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; line-height: 1.4;">${notification.message}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">${formatDate(notification.createdAt)}</p>
          ${notification.actionUrl ? `<a href="${notification.actionUrl}" style="color: #3b82f6; font-size: 11px; text-decoration: none;">Ver detalhes →</a>` : ''}
        </div>
      </div>
      ${!notification.isRead ? '<div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; flex-shrink: 0;"></div>' : ''}
    </div>
  `;

  // Marcar como lida ao clicar
  div.addEventListener('click', () => {
    if (!notification.isRead) {
      markNotificationAsReadById(notification.id);
    }
  });

  return div;
}

// Função para formatar data
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Agora mesmo';
  } else if (diffInHours < 24) {
    return `${diffInHours}h atrás`;
  } else if (diffInHours < 48) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Aplicar filtros de notificação
function applyNotificationFilter() {
  currentFilter = document.getElementById('notificationFilter').value;
  currentLimit = parseInt(document.getElementById('notificationLimit').value);
  currentPage = 1;
  fetchUserNotifications();
}

// Navegar para página anterior
function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    fetchUserNotifications();
  }
}

// Navegar para próxima página
function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    fetchUserNotifications();
  }
}

// Atualizar controles de paginação
function updatePaginationControls() {
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const currentPageSpan = document.getElementById('currentPage');
  
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
  currentPageSpan.textContent = currentPage;
}

// Atualizar estatísticas de notificações
function updateNotificationStats(data) {
  const statsDiv = document.getElementById('notificationStats');
  const totalDiv = document.getElementById('totalNotifications');
  const unreadDiv = document.getElementById('unreadNotifications');
  const readDiv = document.getElementById('readNotifications');
  
  if (data.stats) {
    totalDiv.textContent = data.stats.total || 0;
    unreadDiv.textContent = data.stats.unread || 0;
    readDiv.textContent = data.stats.read || 0;
    statsDiv.style.display = 'block';
  }
}

// Atualizar badge de notificações não lidas
function updateUnreadBadge(count) {
  const badge = document.getElementById('unreadBadge');
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

// Marcar todas as notificações como lidas
function markAllAsRead() {
  apiCall('/me/notifications/read-all', 'PUT').then(({data}) => {
    showResponse('notificationsResponse', data);
    // Recarregar notificações após marcar todas como lidas
    fetchUserNotifications();
    fetchUnreadCount();
  });
}

// Funções de interface (mantidas para compatibilidade)
function getMyNotifications() {
  fetchUserNotifications();
}

function getUnreadCount() {
  fetchUnreadCount();
}

function markNotificationAsRead() {
  const id = document.getElementById('notificationId');
  if (id && id.value) {
    markNotificationAsReadById(id.value);
  } else {
    showError('Por favor, insira o ID da notificação');
  }
}

// =========================================
// 🔌 FUNÇÕES DE WEBSOCKET ATUALIZADAS
// =========================================

// Conectar WebSocket
function connectWebSocket() {
  if (!token) {
    showError('Token de autenticação não encontrado');
    return;
  }

  updateWSStatus('connecting', 'Conectando...');

  socket = io(`${API_BASE}/notifications`, {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling'],
    forceNew: true
  });

  socket.on('connect', () => {
    updateWSStatus('connected', 'WebSocket: Conectado');
    reconnectAttempts = 0;
    console.log('WebSocket conectado');
  });

  socket.on('disconnect', () => {
    updateWSStatus('disconnected', 'WebSocket: Desconectado');
    console.log('WebSocket desconectado');
  });

  socket.on('new-notification', (notification) => {
    console.log('Nova notificação recebida:', notification);
    addRealtimeNotification(notification);
    showNotificationToast(notification);
    fetchUnreadCount(); // Atualizar contador
  });

  socket.on('connect_error', (error) => {
    console.error('Erro de conexão WebSocket:', error);
    updateWSStatus('error', 'WebSocket: Erro de conexão');
    
    // Tentar reconectar após 5 segundos
    setTimeout(() => {
      if (reconnectAttempts < 5) {
        reconnectAttempts++;
        connectWebSocket();
      }
    }, 5000);
  });
}

// Adicionar notificação em tempo real
function addRealtimeNotification(notification) {
  const container = document.getElementById('realtimeContainer');
  const notificationElement = createNotificationElement(notification);
  
  // Adicionar no topo
  container.insertBefore(notificationElement, container.firstChild);
  
  // Limitar a 10 notificações em tempo real
  const notifications = container.querySelectorAll('.notification-item');
  if (notifications.length > 10) {
    container.removeChild(notifications[notifications.length - 1]);
  }
}

// Mostrar toast de notificação
function showNotificationToast(notification) {
  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="font-size: 24px;">🔔</div>
      <div>
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${notification.title}</div>
        <div style="color: #6b7280; font-size: 14px;">${notification.message}</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Remover após 5 segundos
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 5000);
}

// Atualizar status do WebSocket
function updateWSStatus(status, message) {
  const statusElement = document.getElementById('wsStatus');
  statusElement.textContent = message;
  statusElement.className = `status-indicator status-${status}`;
}

