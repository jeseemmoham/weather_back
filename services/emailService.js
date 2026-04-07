const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
  }

  // Initialize email transporter
  init() {
    const { EMAIL_USER, EMAIL_PASS } = process.env;

    if (!EMAIL_USER || !EMAIL_PASS || EMAIL_USER === 'your_email@gmail.com') {
      console.log('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASS in .env');
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    this.isConfigured = true;
    console.log('📧 Email service configured');
  }

  // Get severity color for email
  getSeverityColor(severity) {
    const colors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#f97316',
      critical: '#ef4444'
    };
    return colors[severity] || '#6b7280';
  }

  // Get type icon for email
  getTypeIcon(type) {
    const icons = {
      weather: '⛈️',
      flood: '🌊',
      earthquake: '🌍',
      emergency: '🚨'
    };
    return icons[type] || '⚠️';
  }

  // Send alert notification email
  async sendAlertEmail(to, alert) {
    if (!this.isConfigured) {
      console.log(`📧 Email skipped (not configured): ${alert.title} → ${to}`);
      return false;
    }

    const severityColor = this.getSeverityColor(alert.severity);
    const typeIcon = this.getTypeIcon(alert.type);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center; border: 1px solid #334155; border-bottom: none;">
            <h1 style="color: #f8fafc; margin: 0; font-size: 24px;">🛡️ Disaster Alert System</h1>
            <p style="color: #94a3b8; margin: 8px 0 0;">Real-time emergency notification</p>
          </div>
          
          <!-- Alert Content -->
          <div style="background-color: #1e293b; padding: 30px; border: 1px solid #334155; border-top: none; border-bottom: none;">
            <!-- Severity Badge -->
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="display: inline-block; background-color: ${severityColor}; color: #fff; padding: 6px 20px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                ${alert.severity} Severity
              </span>
            </div>

            <!-- Alert Title -->
            <h2 style="color: #f8fafc; margin: 0 0 16px; font-size: 22px; text-align: center;">
              ${typeIcon} ${alert.title}
            </h2>

            <!-- Alert Details -->
            <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; border-left: 4px solid ${severityColor};">
              <p style="color: #cbd5e1; margin: 0; font-size: 15px; line-height: 1.6;">
                ${alert.description}
              </p>
            </div>

            <!-- Meta Info -->
            <div style="margin-top: 20px; display: flex; justify-content: space-between;">
              <div style="background-color: #0f172a; border-radius: 8px; padding: 12px 16px; flex: 1; margin-right: 8px; text-align: center;">
                <p style="color: #64748b; margin: 0; font-size: 11px; text-transform: uppercase;">Type</p>
                <p style="color: #f8fafc; margin: 4px 0 0; font-size: 14px; font-weight: 600;">${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</p>
              </div>
              <div style="background-color: #0f172a; border-radius: 8px; padding: 12px 16px; flex: 1; margin-left: 8px; text-align: center;">
                <p style="color: #64748b; margin: 0; font-size: 11px; text-transform: uppercase;">ZIP Code</p>
                <p style="color: #f8fafc; margin: 4px 0 0; font-size: 14px; font-weight: 600;">${alert.zipCode}</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 0 0 16px 16px; padding: 20px; text-align: center; border: 1px solid #334155; border-top: none;">
            <p style="color: #64748b; margin: 0; font-size: 12px;">
              You received this because you're subscribed to alerts for ZIP code ${alert.zipCode}.
            </p>
            <p style="color: #475569; margin: 8px 0 0; font-size: 11px;">
              © ${new Date().getFullYear()} Disaster Alert System
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"🛡️ Disaster Alert System" <${process.env.EMAIL_USER}>`,
        to,
        subject: `${typeIcon} [${alert.severity.toUpperCase()}] ${alert.title} - ZIP ${alert.zipCode}`,
        html: htmlContent
      });

      console.log(`📧 Alert email sent: ${alert.title} → ${to}`);
      return true;
    } catch (error) {
      console.error(`📧 Email error: ${error.message}`);
      return false;
    }
  }
}

module.exports = new EmailService();
