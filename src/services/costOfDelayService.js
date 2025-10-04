import { salaryService } from './salaryService';

export class CostOfDelayService {
  constructor() {
    this.tickets = new Map();
    this.delayHistory = new Map(); // Track delay history for each ticket
  }

  // Add or update a ticket
  addTicket(ticket) {
    const ticketId = this.generateTicketId(ticket);
    const ticketData = {
      ...ticket,
      id: ticketId,
      createdAt: new Date(),
      status: 'active',
      delayDays: 0,
      totalDelayCost: 0
    };
    
    this.tickets.set(ticketId, ticketData);
    return ticketId;
  }

  generateTicketId(ticket) {
    const timestamp = Date.now();
    const issuer = ticket.issuerName?.replace(/\s+/g, '') || 'unknown';
    return `${issuer}_${timestamp}`;
  }

  // Calculate cost of delay for all overdue tickets
  calculateCostOfDelay() {
    const today = new Date();
    const overdueTickets = [];
    const managerCosts = new Map(); // Track costs by manager

    for (const [ticketId, ticket] of this.tickets) {
      if (ticket.status === 'active' && ticket.deadline) {
        const deadline = new Date(ticket.deadline);
        const daysOverdue = Math.ceil((today - deadline) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue > 0) {
          const dailyCost = salaryService.getDailyCost(ticket.issuedto);
          const delayCost = dailyCost * daysOverdue;
          
          // Update ticket with delay information
          ticket.delayDays = daysOverdue;
          ticket.totalDelayCost = delayCost;
          ticket.lastCalculated = today;
          
          overdueTickets.push({
            ...ticket,
            dailyCost,
            delayCost
          });

          // Track costs by manager (issuer)
          const managerKey = ticket.issuerEmail || ticket.issuerName;
          if (!managerCosts.has(managerKey)) {
            managerCosts.set(managerKey, {
              managerName: ticket.issuerName,
              managerEmail: ticket.issuerEmail,
              totalCost: 0,
              tickets: []
            });
          }
          
          const managerData = managerCosts.get(managerKey);
          managerData.totalCost += delayCost;
          managerData.tickets.push({
            ticketId,
            issuedTo: ticket.issuedto,
            delayDays: daysOverdue,
            dailyCost,
            delayCost,
            description: ticket.description
          });
        }
      }
    }

    return {
      overdueTickets,
      managerCosts: Array.from(managerCosts.values()),
      totalCost: Array.from(managerCosts.values()).reduce((sum, manager) => sum + manager.totalCost, 0)
    };
  }

  // Get delay history for a specific ticket
  getDelayHistory(ticketId) {
    return this.delayHistory.get(ticketId) || [];
  }

  // Update delay history
  updateDelayHistory(ticketId, delayInfo) {
    if (!this.delayHistory.has(ticketId)) {
      this.delayHistory.set(ticketId, []);
    }
    
    const history = this.delayHistory.get(ticketId);
    history.push({
      date: new Date(),
      delayDays: delayInfo.delayDays,
      cost: delayInfo.cost
    });
  }

  // Get all tickets
  getAllTickets() {
    return Array.from(this.tickets.values());
  }

  // Get ticket by ID
  getTicket(ticketId) {
    return this.tickets.get(ticketId);
  }

  // Mark ticket as completed
  completeTicket(ticketId) {
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.status = 'completed';
      ticket.completedAt = new Date();
    }
  }

  // Remove ticket from tracking
  removeTicket(ticketId) {
    this.tickets.delete(ticketId);
    this.delayHistory.delete(ticketId);
  }

  // Generate email content for manager
  generateManagerEmail(managerData) {
    const { managerName, managerEmail, totalCost, tickets } = managerData;
    
    let emailContent = `
Subject: Cost of Delay Report - ${new Date().toLocaleDateString()}

Dear ${managerName},

The following tickets assigned to your team are overdue and incurring daily costs:

`;

    tickets.forEach(ticket => {
      emailContent += `
Ticket: ${ticket.ticketId}
Assigned to: ${ticket.issuedTo}
Delay: ${ticket.delayDays} day(s)
Daily Cost: $${ticket.dailyCost.toFixed(2)}
Total Delay Cost: $${ticket.delayCost.toFixed(2)}
Description: ${ticket.description}

`;
    });

    emailContent += `
Total Cost of Delay: $${totalCost.toFixed(2)}

Please ensure these tickets are prioritized and completed as soon as possible to minimize additional costs.

Best regards,
Ticket Triage System
`;

    return emailContent;
  }

  // Send email notification (mock implementation)
  async sendManagerNotification(managerData) {
    const emailContent = this.generateManagerEmail(managerData);
    
    // In a real implementation, this would integrate with an email service
    console.log('Email to be sent:', emailContent);
    
    // For demo purposes, we'll return the email content
    return {
      success: true,
      emailContent,
      recipient: managerData.managerEmail,
      subject: `Cost of Delay Report - ${new Date().toLocaleDateString()}`
    };
  }

  // Process all overdue tickets and send notifications
  async processOverdueTickets() {
    const costData = this.calculateCostOfDelay();
    const notifications = [];

    for (const managerData of costData.managerCosts) {
      if (managerData.managerEmail) {
        const notification = await this.sendManagerNotification(managerData);
        notifications.push(notification);
      }
    }

    return {
      costData,
      notifications
    };
  }
}

export const costOfDelayService = new CostOfDelayService();
