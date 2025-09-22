 // ====================================
    // SISTEMA DE FEATURE FLAGS
    // ====================================
    class FeatureFlags {
      constructor() {
        this.flags = {
          advancedDashboard: false,
          premiumBooking: false,
          smartNotifications: true,
          analyticsAdvanced: false,
          customLink: true
        };
        
        this.loadFromStorage();
        this.initToggleListeners();
      }

      isEnabled(flagName) {
        return this.flags[flagName] || false;
      }

      toggle(flagName) {
        this.flags[flagName] = !this.flags[flagName];
        this.saveToStorage();
        this.applyFlag(flagName);
        
        if (this.isEnabled('smartNotifications')) {
          this.showNotification(`Feature "${flagName}" ${this.flags[flagName] ? 'ativada' : 'desativada'}`);
        }
      }

      applyFlag(flagName) {
        const body = document.body;
        
        switch (flagName) {
          case 'advancedDashboard':
            body.classList.toggle('advanced-dashboard', this.flags[flagName]);
            break;
            
          case 'premiumBooking':
            body.classList.toggle('premium-booking', this.flags[flagName]);
            break;
            
          case 'analyticsAdvanced':
            body.classList.toggle('analytics-advanced', this.flags[flagName]);
            break;
            
          case 'smartNotifications':
            body.classList.toggle('smart-notifications', this.flags[flagName]);
            break;
        }
      }

      applyAllFlags() {
        Object.keys(this.flags).forEach(flag => this.applyFlag(flag));
      }

      saveToStorage() {
        // Em produção, salvaria no localStorage ou backend
        console.log('Feature flags salvos:', this.flags);
      }

      loadFromStorage() {
        // Em produção, carregaria do localStorage ou backend
        console.log('Feature flags carregados');
      }

      showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }

      initToggleListeners() {
        document.querySelectorAll('.toggle').forEach(toggle => {
          const flagName = toggle.dataset.flag;
          
          // Set initial state
          toggle.classList.toggle('active', this.flags[flagName]);
          
          toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            this.toggle(flagName);
          });
        });
      }
    }

    // ====================================
    // SISTEMA DE AUTENTICAÇÃO
    // ====================================
    class AuthService {
      constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
      }

      async login(email, password) {
        try {
          // Simulação de login - em produção seria uma chamada real à API
          if (email === 'admin@barbershop.com' && password === '123456') {
            const mockUser = { id: 1, name: 'Admin Barbeiro', email };
            const mockToken = 'mock-jwt-token-' + Date.now();
            
            this.token = mockToken;
            this.user = mockUser;
            
            localStorage.setItem('authToken', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            return { success: true, user: mockUser, token: mockToken };
          } else {
            throw new Error('Credenciais inválidas');
          }
        } catch (error) {
          throw error;
        }
      }

      logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }

      isAuthenticated() {
        return !!this.token;
      }
    }

    // ====================================
    // SISTEMA DE NAVEGAÇÃO
    // ====================================
    class Navigation {
      constructor() {
        this.currentPage = 'dashboard';
        this.initNavigation();
      }

      initNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
          link.addEventListener('click', (e) => {
            if (link.dataset.page) {
              e.preventDefault();
              this.navigateTo(link.dataset.page);
            }
          });
        });
      }

      navigateTo(pageId) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
        });

        // Add active class to current nav link
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
          page.classList.remove('active');
        });

        // Show current page
        document.getElementById(pageId).classList.add('active');

        this.currentPage = pageId;
      }
    }

    // ====================================
    // SISTEMA DE CALENDÁRIO
    // ====================================
    class Calendar {
      constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.availableSlots = [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
        ];
        
        this.initCalendar();
      }

      initCalendar() {
        this.renderCalendar();
        
        document.getElementById('prevMonth').addEventListener('click', () => {
          this.currentDate.setMonth(this.currentDate.getMonth() - 1);
          this.renderCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
          this.currentDate.setMonth(this.currentDate.getMonth() + 1);
          this.renderCalendar();
        });
      }

      renderCalendar() {
        const calendar = document.getElementById('calendar');
        const monthYear = document.getElementById('monthYear');
        
        // Clear existing days (keep headers)
        const dayElements = calendar.querySelectorAll('.calendar-day');
        dayElements.forEach(day => day.remove());
        
        // Update month/year display
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        monthYear.textContent = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Get first day of month and number of days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const today = new Date();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay.getDay(); i++) {
          const emptyDay = document.createElement('div');
          emptyDay.className = 'calendar-day disabled';
          calendar.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
          const dayElement = document.createElement('button');
          dayElement.className = 'calendar-day';
          dayElement.textContent = day;
          
          const currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
          const diffTime = currentDate - today;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          // Disable past dates and dates more than 30 days ahead
          if (diffDays < 0 || diffDays > 30) {
            dayElement.classList.add('disabled');
            dayElement.disabled = true;
          } else {
            dayElement.addEventListener('click', () => this.selectDate(currentDate, dayElement));
          }
          
          // Mark today
          if (diffDays === 0) {
            dayElement.classList.add('today');
          }
          
          calendar.appendChild(dayElement);
        }
      }

      selectDate(date, element) {
        this.selectedDate = date;
        
        // Update UI
        document.querySelectorAll('.calendar-day').forEach(day => {
          day.classList.remove('selected');
        });
        element.classList.add('selected');
        
        // Update date info
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                       'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        document.getElementById('selectedDateInfo').textContent = 
          `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
        
        this.renderTimeSlots();
        this.updateBookingButton();
      }

      renderTimeSlots() {
        const container = document.getElementById('timeSlots');
        container.innerHTML = '';
        
        if (!this.selectedDate) {
          return;
        }
        
        this.availableSlots.forEach(time => {
          const slot = document.createElement('button');
          slot.className = 'time-slot';
          slot.textContent = time;
          slot.type = 'button';
          
          // Simulate some unavailable slots
          if (Math.random() > 0.8) {
            slot.classList.add('unavailable');
            slot.disabled = true;
          } else {
            slot.addEventListener('click', () => this.selectTime(time, slot));
          }
          
          container.appendChild(slot);
        });
      }

      selectTime(time, element) {
        this.selectedTime = time;
        
        // Update UI
        document.querySelectorAll('.time-slot').forEach(slot => {
          slot.classList.remove('selected');
        });
        element.classList.add('selected');
        
        this.updateBookingButton();
      }

      updateBookingButton() {
        const btn = document.getElementById('confirmBooking');
        const name = document.getElementById('clientName').value.trim();
        const service = document.getElementById('serviceSelect').value;
        
        const isValid = this.selectedDate && this.selectedTime && name && service;
        btn.disabled = !isValid;
        btn.textContent = isValid ? 'Confirmar Agendamento' : 'Preencha todos os campos';
      }
    }

    // ====================================
    // SISTEMA DE AGENDAMENTOS
    // ====================================
    class AppointmentService {
      constructor() {
        this.appointments = this.loadAppointments();
      }

      loadAppointments() {
        // Dados mock para demonstração
        return [
          {
            id: 1,
            name: 'João Silva',
            service: 'Corte + Barba',
            date: new Date().toISOString().split('T')[0],
            time: '14:00',
            notes: 'Barba por fazer'
          },
          {
            id: 2,
            name: 'Pedro Santos',
            service: 'Corte Masculino',
            date: new Date().toISOString().split('T')[0],
            time: '15:30',
            notes: ''
          },
          {
            id: 3,
            name: 'Carlos Oliveira',
            service: 'Barba',
            date: new Date().toISOString().split('T')[0],
            time: '16:00',
            notes: ''
          }
        ];
      }

      async createAppointment(appointmentData) {
        const newAppointment = {
          id: Date.now(),
          ...appointmentData,
          createdAt: new Date().toISOString()
        };

        this.appointments.push(newAppointment);
        this.saveAppointments();
        
        return newAppointment;
      }

      getAppointments(date = null) {
        if (date) {
          return this.appointments.filter(apt => apt.date === date);
        }
        return this.appointments;
      }

      saveAppointments() {
        // Em produção salvaria no backend
        localStorage.setItem('appointments', JSON.stringify(this.appointments));
      }

      updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = this.appointments.filter(apt => apt.date === today);
        
        document.getElementById('todayAppointments').textContent = todayAppointments.length;
        
        // Simular outras estatísticas
        const monthRevenue = todayAppointments.length * 50; // Média de R$50 por serviço
        document.getElementById('monthRevenue').textContent = `R$ ${monthRevenue * 20}`; // Simular mês
        
        const occupancyRate = Math.min(100, (todayAppointments.length / 12) * 100);
        document.getElementById('occupancyRate').textContent = `${Math.round(occupancyRate)}%`;
        
        document.getElementById('uniqueClients').textContent = 
          new Set(this.appointments.map(apt => apt.name)).size;
      }
    }

    // ====================================
    // SISTEMA PRINCIPAL
    // ====================================
    class BarberShopApp {
      constructor() {
        this.auth = new AuthService();
        this.featureFlags = new FeatureFlags();
        this.navigation = new Navigation();
        this.calendar = new Calendar();
        this.appointmentService = new AppointmentService();
        
        this.initApp();
      }

      initApp() {
        // Verificar autenticação
        if (this.auth.isAuthenticated()) {
          this.showMainApp();
        } else {
          this.showLogin();
        }

        this.initEventListeners();
        this.featureFlags.applyAllFlags();
        this.appointmentService.updateStats();
        this.loadAllAppointments();
      }

      showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
      }

      showMainApp() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
      }

      initEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('loginEmail').value;
          const password = document.getElementById('loginPassword').value;
          
          try {
            await this.auth.login(email, password);
            this.showMainApp();
            
            if (this.featureFlags.isEnabled('smartNotifications')) {
              this.featureFlags.showNotification('Login realizado com sucesso!');
            }
          } catch (error) {
            alert('Erro no login: ' + error.message);
          }
        });

        // Booking form
        document.getElementById('bookingForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.handleBooking();
        });

        // Form inputs for validation
        ['clientName', 'serviceSelect'].forEach(id => {
          document.getElementById(id).addEventListener('input', () => {
            this.calendar.updateBookingButton();
          });
        });

        // Barbershop name input
        document.getElementById('barbershopName').addEventListener('input', (e) => {
          this.updateGeneratedLink(e.target.value);
        });
      }

      async handleBooking() {
        const appointmentData = {
          name: document.getElementById('clientName').value,
          service: document.getElementById('serviceSelect').value,
          date: this.calendar.selectedDate.toISOString().split('T')[0],
          time: this.calendar.selectedTime,
          notes: document.getElementById('notes').value
        };

        try {
          await this.appointmentService.createAppointment(appointmentData);
          
          if (this.featureFlags.isEnabled('smartNotifications')) {
            this.featureFlags.showNotification(
              `Agendamento confirmado para ${appointmentData.date} às ${appointmentData.time}!`
            );
          }

          // Reset form
          this.resetBookingForm();
          this.appointmentService.updateStats();
          this.loadAllAppointments();
          
        } catch (error) {
          alert('Erro ao criar agendamento: ' + error.message);
        }
      }

      resetBookingForm() {
        document.getElementById('bookingForm').reset();
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
          day.classList.remove('selected');
        });
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
          slot.classList.remove('selected');
        });
        
        this.calendar.selectedDate = null;
        this.calendar.selectedTime = null;
        document.getElementById('timeSlots').innerHTML = '';
        document.getElementById('selectedDateInfo').textContent = 'Selecione uma data para ver os horários';
        this.calendar.updateBookingButton();
      }

      loadAllAppointments() {
        const container = document.getElementById('allAppointments');
        const appointments = this.appointmentService.getAppointments();
        
        container.innerHTML = appointments.map(apt => `
          <div class="appointment-item">
            <div class="appointment-info">
              <h4>${apt.name}</h4>
              <div class="appointment-meta">
                ${apt.service} • ${new Date(apt.date).toLocaleDateString('pt-BR')}
                ${apt.notes ? ' • ' + apt.notes : ''}
              </div>
            </div>
            <div class="appointment-time">${apt.time}</div>
          </div>
        `).join('');
      }

      updateGeneratedLink(barbershopName) {
        const slug = barbershopName.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-');
        
        const link = `https://agendacomigo.com/agendar/${slug}`;
        document.getElementById('generatedLink').textContent = link;
      }
    }

    // ====================================
    // FUNÇÕES GLOBAIS
    // ====================================
    function logout() {
      app.auth.logout();
      app.showLogin();
      
      if (app.featureFlags.isEnabled('smartNotifications')) {
        app.featureFlags.showNotification('Logout realizado com sucesso!');
      }
    }

    function copyLink() {
      const link = document.getElementById('generatedLink').textContent;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
          if (app.featureFlags.isEnabled('smartNotifications')) {
            app.featureFlags.showNotification('Link copiado para a área de transferência!');
          }
        });
      } else {
        // Fallback para navegadores antigos
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (app.featureFlags.isEnabled('smartNotifications')) {
          app.featureFlags.showNotification('Link copiado!');
        }
      }
    }

    // ====================================
    // INICIALIZAÇÃO
    // ====================================
    let app;
    
    document.addEventListener('DOMContentLoaded', () => {
      app = new BarberShopApp();
    });