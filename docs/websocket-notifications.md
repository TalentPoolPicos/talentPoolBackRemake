# 🔔 WebSocket Notifications

Este sistema de notificações combina APIs REST com WebSocket para uma experiência completa de notificações em tempo real.

## 📡 Arquitetura Híbrida

O sistema utiliza duas abordagens complementares:

- **REST API**: Para buscar histórico, marcar como lidas e gerenciar notificações
- **WebSocket**: Para receber notificações em tempo real

## 🚀 Configuração do WebSocket

### Endpoint
```
ws://localhost:3000/notifications
```

### Autenticação
Inclua o token JWT na conexão:

```javascript
const socket = io('http://localhost:3000/notifications', {
  auth: { token: 'your-jwt-token' }
});
```

### Eventos Disponíveis

| Evento | Descrição |
|--------|-----------|
| `connect` | Conectado com sucesso ao WebSocket |
| `notification` | Recebe notificações em tempo real |
| `disconnect` | Desconectado do WebSocket |
| `connection-status` | Status da conexão |

### Gerenciamento de Salas

Os usuários são automaticamente adicionados às seguintes salas:
- `user:{userId}` - Sala específica do usuário
- `role:{userRole}` - Sala baseada no papel (student/enterprise)

## 📋 Fluxo Recomendado

### 1. Inicialização
```javascript
// 1. Buscar histórico via REST API
const response = await fetch('/me/notifications?page=1&limit=20', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 2. Conectar ao WebSocket para tempo real
const socket = io('/notifications', { auth: { token } });
```

### 2. Receber Notificações em Tempo Real
```javascript
socket.on('notification', (notification) => {
  console.log('Nova notificação:', notification);
  // Adicionar à interface
  addNotificationToUI(notification);
});
```

### 3. Marcar como Lida
```javascript
// Via REST API
await fetch(`/me/notifications/${notificationId}/read`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🔌 Exemplo de Implementação Completa

```javascript
class NotificationManager {
  constructor(apiBase, token) {
    this.apiBase = apiBase;
    this.token = token;
    this.socket = null;
    this.notifications = [];
  }

  async initialize() {
    // Carregar histórico
    await this.loadHistory();
    
    // Conectar WebSocket
    await this.connectWebSocket();
  }

  async loadHistory() {
    const response = await fetch(`${this.apiBase}/me/notifications`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    const data = await response.json();
    this.notifications = data.notifications.notifications;
  }

  connectWebSocket() {
    this.socket = io(`${this.apiBase}/notifications`, {
      auth: { token: this.token }
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado ao WebSocket');
    });

    this.socket.on('notification', (notification) => {
      this.notifications.unshift(notification);
      this.showNotification(notification);
    });
  }

  async markAsRead(notificationId) {
    await fetch(`${this.apiBase}/me/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
  }
}
```

## 📊 Tipos de Notificação

| Tipo | Descrição | Destinatário |
|------|-----------|--------------|
| `job_application_received` | Nova candidatura recebida | Empresa |
| `job_published` | Nova vaga publicada | Estudantes (broadcast) |
| `profile_liked` | Perfil curtido | Usuário específico |
| `system_announcement` | Anúncio do sistema | Todos (broadcast) |

## 🧪 Interface de Teste

Para testar o sistema completo, acesse:
```
http://localhost:8080/notification-tester.html
```

A interface permite:
- ✅ Fazer login e conectar ao WebSocket
- ✅ Simular diferentes tipos de notificações
- ✅ Testar APIs REST de consulta
- ✅ Marcar notificações como lidas
- ✅ Visualizar notificações em tempo real

## 🔧 Configuração de Desenvolvimento

### Dependências
```bash
npm install socket.io @nestjs/websockets
```

### Variáveis de Ambiente
```env
PORT=3000
JWT_SECRET=your-secret-key
```

### CORS
O WebSocket está configurado para aceitar conexões de qualquer origem em desenvolvimento:
```typescript
@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/notifications'
})
```

## 🚨 Considerações de Produção

1. **CORS**: Configurar origins específicas em produção
2. **Rate Limiting**: Implementar limite de conexões por usuário
3. **Monitoring**: Monitorar conexões ativas e performance
4. **Scaling**: Considerar Redis Adapter para múltiplas instâncias

## 📚 APIs REST Relacionadas

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/me/notifications` | GET | Buscar histórico com paginação |
| `/me/notifications/:id/read` | PUT | Marcar notificação como lida |
| `/me/notifications/read-all` | PUT | Marcar todas como lidas |
| `/me/notifications/unread-count` | GET | Contagem de não lidas |

Para documentação completa das APIs, acesse: `/doc`