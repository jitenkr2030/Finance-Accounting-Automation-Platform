/**
 * Customer Portal Test Suite
 * Compliance & Documents Category
 * Self-Service Customer Interface with Document Management and Communication
 */

const request = require('supertest');
const mongoose = require('mongoose');

describe('Customer Portal Engine', () => {
  let app;
  let testUser;
  let testCustomer;
  let testPortal;
  let testDocument;
  let testCommunication;
  let authToken;
  let customerToken;
  
  beforeAll(async () => {
    // Setup test environment
    app = require('../src/app');
    
    // Create test user (customer portal admin)
    testUser = await User.create({
      username: 'portal_admin',
      email: 'admin@portal.com',
      password: 'TestPassword123!',
      role: 'portal_administrator',
      permissions: ['portal.create', 'portal.edit', 'portal.view', 'portal.manage_customers'],
      companyId: 'test_company_portal'
    });
    
    // Generate auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'portal_admin',
        password: 'TestPassword123!'
      });
    authToken = loginResponse.body.token;
    
    // Create test customer
    testCustomer = await Customer.create({
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '+1-555-0199',
      companyType: 'corporate',
      industry: 'Manufacturing',
      registrationNumber: 'REG123456789',
      taxId: 'TAX987654321',
      status: 'active',
      onboardingStatus: 'completed',
      portalAccess: {
        enabled: true,
        username: 'acme_corp',
        lastLogin: new Date(),
        preferences: {
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        }
      }
    });
  });
  
  afterAll(async () => {
    // Cleanup test data
    await User.deleteMany({ email: 'admin@portal.com' });
    await Customer.deleteMany({});
    await Portal.deleteMany({});
    await PortalDocument.deleteMany({});
    await PortalCommunication.deleteMany({});
    await PortalTicket.deleteMany({});
    await PortalSession.deleteMany({});
    await mongoose.connection.close();
  });
  
  describe('Portal Configuration & Setup', () => {
    test('should create customer portal with branding and configuration', async () => {
      const portalData = {
        name: 'Acme Customer Portal',
        description: 'Self-service portal for Acme Corporation customers',
        customerId: testCustomer._id,
        domain: 'portal.acme.com',
        theme: {
          primaryColor: '#1e40af',
          secondaryColor: '#f3f4f6',
          logo: 'https://acme.com/logo.png',
          favicon: 'https://acme.com/favicon.ico',
          fontFamily: 'Inter',
          customCSS: '.portal-header { background: linear-gradient(135deg, #1e40af, #3b82f6); }'
        },
        navigation: {
          menuItems: [
            {
              label: 'Dashboard',
              url: '/dashboard',
              icon: 'home',
              order: 1,
              visible: true
            },
            {
              label: 'Documents',
              url: '/documents',
              icon: 'document',
              order: 2,
              visible: true
            },
            {
              label: 'Invoices',
              url: '/invoices',
              icon: 'receipt',
              order: 3,
              visible: true
            },
            {
              label: 'Support',
              url: '/support',
              icon: 'help',
              order: 4,
              visible: true
            },
            {
              label: 'Profile',
              url: '/profile',
              icon: 'user',
              order: 5,
              visible: true
            }
          ],
          footerLinks: [
            { label: 'Privacy Policy', url: '/privacy' },
            { label: 'Terms of Service', url: '/terms' },
            { label: 'Contact Us', url: '/contact' }
          ]
        },
        features: {
          documentManagement: {
            enabled: true,
            allowedTypes: ['invoice', 'contract', 'statement', 'report'],
            maxFileSize: 10485760, // 10MB
            allowedFormats: ['pdf', 'xlsx', 'docx', 'jpg', 'png']
          },
          communication: {
            enabled: true,
            chatSupport: true,
            ticketSystem: true,
            emailNotifications: true
          },
          selfService: {
            enabled: true,
            profileManagement: true,
            passwordReset: true,
            accountSettings: true
          },
          analytics: {
            enabled: true,
            trackUsage: true,
            generateReports: true
          }
        },
        security: {
          sessionTimeout: 3600, // 1 hour
          requireMFA: false,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          },
          ipRestrictions: [],
          allowedDomains: ['acme.com', 'subsidiary.com']
        },
        integrations: {
          sso: {
            enabled: true,
            provider: 'saml',
            config: {
              entityId: 'https://portal.acme.com/metadata',
              ssoUrl: 'https://idp.acme.com/sso',
              certificate: 'MIIC...'
            }
          },
          email: {
            enabled: true,
            provider: 'sendgrid',
            apiKey: 'SG.xxxxxx',
            templates: {
              welcome: 'welcome_email_template',
              resetPassword: 'password_reset_template',
              notification: 'notification_template'
            }
          }
        },
        status: 'active',
        published: true,
        launchDate: new Date()
      };
      
      const response = await request(app)
        .post('/api/portal/portals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(portalData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: portalData.name,
        description: portalData.description,
        customerId: testCustomer._id.toString(),
        domain: portalData.domain,
        theme: portalData.theme,
        navigation: portalData.navigation,
        features: portalData.features,
        security: portalData.security,
        status: portalData.status,
        published: portalData.published
      });
      
      testPortal = response.body;
    });
    
    test('should validate portal domain and SSL configuration', async () => {
      const invalidPortalData = {
        name: 'Invalid Portal',
        domain: 'invalid-domain', // Invalid format
        sslRequired: true,
        certificateInfo: null // Missing certificate
      };
      
      const response = await request(app)
        .post('/api/portal/portals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPortalData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'domain',
          message: expect.stringContaining('Invalid domain format')
        })
      );
    });
    
    test('should customize portal for different customer tiers', async () => {
      const tierConfigurations = [
        {
          tier: 'basic',
          features: {
            documentManagement: { enabled: true, maxFiles: 50 },
            communication: { enabled: true, chatSupport: false },
            analytics: { enabled: false }
          },
          branding: {
            primaryColor: '#6b7280',
            logo: 'https://cdn.basic.com/logo-basic.png'
          }
        },
        {
          tier: 'premium',
          features: {
            documentManagement: { enabled: true, maxFiles: 500 },
            communication: { enabled: true, chatSupport: true },
            analytics: { enabled: true, advancedReports: true }
          },
          branding: {
            primaryColor: '#1e40af',
            logo: 'https://cdn.premium.com/logo-premium.png'
          }
        },
        {
          tier: 'enterprise',
          features: {
            documentManagement: { enabled: true, maxFiles: -1 }, // Unlimited
            communication: { enabled: true, dedicatedSupport: true },
            analytics: { enabled: true, customReports: true },
            whiteLabel: true
          },
          branding: {
            primaryColor: '#custom-color',
            logo: 'https://enterprise.com/logo.png',
            customDomain: true
          }
        }
      ];
      
      for (const config of tierConfigurations) {
        const portalData = {
          name: `${config.tier.charAt(0).toUpperCase() + config.tier.slice(1)} Portal`,
          customerId: testCustomer._id,
          tier: config.tier,
          features: config.features,
          theme: {
            primaryColor: config.branding.primaryColor,
            logo: config.branding.logo
          },
          whiteLabel: config.features.whiteLabel || false
        };
        
        const response = await request(app)
          .post('/api/portal/portals')
          .set('Authorization', `Bearer ${authToken}`)
          .send(portalData)
          .expect(201);
        
        expect(response.body.tier).toBe(config.tier);
        expect(response.body.theme.primaryColor).toBe(config.branding.primaryColor);
        expect(response.body.whiteLabel).toBe(config.features.whiteLabel || false);
      }
    });
    
    test('should handle portal deployment and SSL certificate management', async () => {
      const deploymentConfig = {
        portalId: testPortal._id,
        environment: 'production',
        sslConfiguration: {
          provider: 'lets_encrypt',
          certificateType: 'wildcard',
          autoRenewal: true,
          renewalDays: 30
        },
        cdn: {
          enabled: true,
          provider: 'cloudflare',
          cacheRules: {
            static: 86400, // 1 day
            api: 300, // 5 minutes
            documents: 3600 // 1 hour
          }
        },
        monitoring: {
          uptime: true,
          performance: true,
          security: true,
          alerting: {
            email: ['admin@acme.com'],
            threshold: 99.9
          }
        }
      };
      
      const response = await request(app)
        .post(`/api/portal/portals/${testPortal._id}/deploy`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(deploymentConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        portalId: testPortal._id.toString(),
        environment: deploymentConfig.environment,
        status: 'deploying',
        sslStatus: 'pending',
        deploymentUrl: expect.stringContaining('https://')
      });
      
      // Simulate deployment completion
      const completionResponse = await request(app)
        .put(`/api/portal/portals/${testPortal._id}/deployment-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          sslStatus: 'active',
          deploymentUrl: 'https://portal.acme.com',
          certificates: [
            {
              domain: 'portal.acme.com',
              type: 'wildcard',
              expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              status: 'active'
            }
          ]
        })
        .expect(200);
      
      expect(completionResponse.body.status).toBe('completed');
      expect(completionResponse.body.sslStatus).toBe('active');
    });
  });
  
  describe('Customer Authentication & Access Control', () => {
    beforeEach(async () => {
      // Create portal user for customer
      const customerUser = await PortalUser.create({
        portalId: testPortal._id,
        customerId: testCustomer._id,
        username: 'acme_user',
        email: 'user@acme.com',
        password: 'SecurePass123!',
        role: 'customer_admin',
        permissions: [
          'document.view',
          'document.upload',
          'profile.edit',
          'support.create',
          'invoice.view'
        ],
        status: 'active',
        mfaEnabled: false,
        lastLogin: new Date(),
        preferences: {
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        }
      });
      
      // Generate customer token
      const customerLoginResponse = await request(app)
        .post('/api/portal/auth/login')
        .send({
          portalId: testPortal._id,
          username: 'acme_user',
          password: 'SecurePass123!'
        });
      
      customerToken = customerLoginResponse.body.token;
    });
    
    test('should handle customer portal authentication', async () => {
      const loginData = {
        portalId: testPortal._id,
        username: 'acme_user',
        password: 'SecurePass123!'
      };
      
      const response = await request(app)
        .post('/api/portal/auth/login')
        .send(loginData)
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(loginData.username);
      expect(response.body.user.portalId).toBe(testPortal._id.toString());
      expect(response.body).toHaveProperty('permissions');
      expect(response.body.permissions).toContain('document.view');
    });
    
    test('should enforce password policy and account lockout', async () => {
      const weakPasswords = [
        '12345678', // Too simple
        'password', // Common password
        'ABCDEFGH' // Only uppercase
      ];
      
      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/portal/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            portalId: testPortal._id,
            username: 'test_user',
            email: 'test@acme.com',
            password: password,
            role: 'customer_user'
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toContainEqual(
          expect.objectContaining({
            field: 'password',
            message: expect.stringContaining('password policy')
          })
        );
      }
      
      // Test account lockout after failed attempts
      const lockoutTest = async () => {
        const wrongCredentials = {
          portalId: testPortal._id,
          username: 'acme_user',
          password: 'WrongPassword'
        };
        
        // Simulate 5 failed login attempts
        for (let i = 0; i < 5; i++) {
          await request(app)
            .post('/api/portal/auth/login')
            .send(wrongCredentials)
            .expect(401);
        }
        
        // Next attempt should be locked out
        const lockoutResponse = await request(app)
          .post('/api/portal/auth/login')
          .send(wrongCredentials)
          .expect(423);
        
        expect(lockoutResponse.body).toHaveProperty('error');
        expect(lockoutResponse.body.error).toBe('Account temporarily locked');
      };
      
      await lockoutTest();
    });
    
    test('should manage customer session and timeout', async () => {
      const sessionResponse = await request(app)
        .get('/api/portal/session')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);
      
      expect(sessionResponse.body).toHaveProperty('user');
      expect(sessionResponse.body).toHaveProperty('permissions');
      expect(sessionResponse.body).toHaveProperty('sessionExpiry');
      expect(sessionResponse.body.sessionExpiry).toBeGreaterThan(Date.now());
      
      // Test session extension
      const extendResponse = await request(app)
        .post('/api/portal/session/extend')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);
      
      expect(extendResponse.body.sessionExpiry).toBeGreaterThan(sessionResponse.body.sessionExpiry);
    });
    
    test('should handle SSO integration', async () => {
      const ssoConfig = {
        portalId: testPortal._id,
        provider: 'saml',
        configuration: {
          entityId: 'https://portal.acme.com/saml',
          ssoUrl: 'https://idp.acme.com/sso/saml',
          sloUrl: 'https://idp.acme.com/slo',
          certificate: 'MIIC...',
          nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
          forceAuthn: false,
          isPassive: false
        },
        attributeMapping: {
          email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
          lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
          groups: 'http://schemas.xmlsoap.org/claims/groups'
        },
        roleMapping: {
          'customer-admin': 'customer_admin',
          'customer-user': 'customer_user',
          'customer-viewer': 'customer_viewer'
        }
      };
      
      const response = await request(app)
        .post('/api/portal/sso/configuration')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ssoConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        portalId: testPortal._id.toString(),
        provider: ssoConfig.provider,
        status: 'configured'
      });
      
      // Test SAML metadata generation
      const metadataResponse = await request(app)
        .get(`/api/portal/portals/${testPortal._id}/sso/metadata`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(metadataResponse.headers['content-type']).toBe('application/xml');
      expect(metadataResponse.text).toContain('EntityDescriptor');
    });
  });
  
  describe('Document Management', () => {
    beforeEach(async () => {
      // Create test document in customer portal
      testDocument = await PortalDocument.create({
        portalId: testPortal._id,
        customerId: testCustomer._id,
        category: 'invoices',
        name: 'Invoice INV-2025-001',
        description: 'Monthly invoice for December 2025',
        fileName: 'INV-2025-001.pdf',
        fileSize: 245760,
        mimeType: 'application/pdf',
        uploadedBy: 'system',
        uploadDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        status: 'active',
        visibility: 'customer',
        tags: ['invoice', '2025', 'monthly'],
        metadata: {
          invoiceNumber: 'INV-2025-001',
          amount: 5000,
          currency: 'USD',
          dueDate: '2025-01-31'
        },
        downloadCount: 0,
        lastAccessed: null
      });
    });
    
    test('should allow customers to view and download documents', async () => {
      const response = await request(app)
        .get(`/api/portal/documents`)
        .set('Authorization', `Bearer ${customerToken}`)
        .query({ category: 'invoices' })
        .expect(200);
      
      expect(response.body).toHaveProperty('documents');
      expect(response.body.documents).toContainEqual(
        expect.objectContaining({
          id: testDocument._id.toString(),
          name: testDocument.name,
          category: testDocument.category,
          downloadUrl: expect.stringContaining('/download')
        })
      );
    });
    
    test('should handle document download with access logging', async () => {
      const response = await request(app)
        .get(`/api/portal/documents/${testDocument._id}/download`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);
      
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      
      // Verify download was logged
      const documentResponse = await request(app)
        .get(`/api/portal/documents/${testDocument._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);
      
      expect(documentResponse.body.downloadCount).toBe(1);
      expect(documentResponse.body.lastAccessed).toBeDefined();
    });
    
    test('should handle document upload by customers', async () => {
      const uploadData = {
        category: 'support',
        name: 'Supporting Document',
        description: 'Customer uploaded supporting document',
        tags: ['support', 'urgent'],
        visibility: 'customer'
      };
      
      const response = await request(app)
        .post('/api/portal/documents/upload')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(uploadData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        portalId: testPortal._id.toString(),
        customerId: testCustomer._id.toString(),
        category: uploadData.category,
        name: uploadData.name,
        uploadedBy: 'customer',
        status: 'pending_review'
      });
    });
    
    test('should handle document version control and history', async () => {
      // Upload new version
      const newVersionData = {
        documentId: testDocument._id,
        name: 'Invoice INV-2025-001 (Updated)',
        version: 2,
        changeLog: 'Updated billing information'
      };
      
      const response = await request(app)
        .post('/api/portal/documents/new-version')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(newVersionData)
        .expect(201);
      
      expect(response.body.version).toBe(2);
      expect(response.body.isLatest).toBe(true);
      expect(response.body.changeLog).toBe(newVersionData.changeLog);
      
      // Verify old version is archived
      const oldVersionResponse = await request(app)
        .get(`/api/portal/documents/${testDocument._id}/versions`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);
      
      expect(oldVersionResponse.body.versions).toHaveLength(2);
      expect(oldVersionResponse.body.versions.find(v => v.version === 1).isLatest).toBe(false);
      expect(oldVersionResponse.body.versions.find(v => v.version === 2).isLatest).toBe(true);
    });
    
    test('should handle document sharing and permissions', async () => {
      const shareConfig = {
        documentId: testDocument._id,
        recipients: [
          {
            email: 'finance@acme.com',
            role: 'viewer',
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        ],
        permissions: ['view', 'download'],
        password: 'SharePassword123',
        watermark: true,
        trackAccess: true
      };
      
      const response = await request(app)
        .post('/api/portal/documents/share')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(shareConfig)
        .expect(201);
      
      expect(response.body).toHaveProperty('shareUrl');
      expect(response.body).toHaveProperty('shareId');
      expect(response.body.permissions).toEqual(shareConfig.permissions);
      expect(response.body.expiryDate).toBeDefined();
      
      // Test access to shared document
      const accessResponse = await request(app)
        .get(`/api/portal/shared/${response.body.shareId}`)
        .send({
          password: 'SharePassword123'
        })
        .expect(200);
      
      expect(accessResponse.body.document).toBeDefined();
      expect(accessResponse.body.accessLog).toBeDefined();
    });
  });
  
  describe('Communication & Support', () => {
    test('should handle customer support tickets', async () => {
      const ticketData = {
        portalId: testPortal._id,
        customerId: testCustomer._id,
        category: 'billing',
        priority: 'high',
        subject: 'Invoice discrepancy for December 2025',
        description: 'The invoice amount does not match our records. Please review.',
        attachments: [
          {
            fileName: 'discrepancy_evidence.pdf',
            fileSize: 102400,
            mimeType: 'application/pdf'
          }
        ],
        requestedResolution: 'Please verify the invoice amount and provide corrected documentation.',
        urgencyLevel: 'urgent'
      };
      
      const response = await request(app)
        .post('/api/portal/support/tickets')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(ticketData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        portalId: testPortal._id.toString(),
        customerId: testCustomer._id.toString(),
        category: ticketData.category,
        priority: ticketData.priority,
        subject: ticketData.subject,
        status: 'open',
        ticketNumber: expect.stringMatching(/^[A-Z0-9]{8}$/)
      });
      
      testCommunication = response.body;
    });
    
    test('should manage ticket workflow and status updates', async () => {
      const statusUpdates = [
        {
          status: 'in_progress',
          assignee: 'billing_team',
          internalNotes: 'Reviewing invoice details with accounting department',
          customerNotification: false
        },
        {
          status: 'resolved',
          resolution: 'Invoice discrepancy has been resolved. Updated invoice sent.',
          customerNotification: true,
          notifyTemplate: 'ticket_resolved'
        }
      ];
      
      for (const update of statusUpdates) {
        const response = await request(app)
          .put(`/api/portal/support/tickets/${testCommunication._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update)
          .expect(200);
        
        expect(response.body.status).toBe(update.status);
        expect(response.body.updateHistory).toHaveLength(1);
      }
    });
    
    test('should handle ticket escalation and SLA tracking', async () => {
      const escalationRules = [
        {
          trigger: 'priority_high_no_response_24h',
          action: 'escalate_to_manager',
          notification: ['support_manager', 'customer']
        },
        {
          trigger: 'priority_critical_no_response_4h',
          action: 'immediate_escalation',
          notification: ['support_manager', 'customer_success']
        }
      ];
      
      // Set ticket to high priority
      await request(app)
        .put(`/api/portal/support/tickets/${testCommunication._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priority: 'high',
          slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
      
      // Simulate SLA breach (in real scenario, this would be handled by scheduled job)
      const slaBreachResponse = await request(app)
        .post(`/api/portal/support/tickets/${testCommunication._id}/sla-check`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentTime: new Date(Date.now() + 25 * 60 * 60 * 1000) // 25 hours later
        })
        .expect(200);
      
      expect(slaBreachResponse.body.slaBreached).toBe(true);
      expect(slaBreachResponse.body.escalationTriggered).toBe(true);
    });
    
    test('should provide customer communication history', async () => {
      // Create additional communications
      await PortalCommunication.create([
        {
          portalId: testPortal._id,
          customerId: testCustomer._id,
          type: 'email',
          subject: 'Welcome to Customer Portal',
          content: 'Welcome to our customer portal...',
          sentBy: 'system',
          sentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          status: 'delivered'
        },
        {
          portalId: testPortal._id,
          customerId: testCustomer._id,
          type: 'notification',
          subject: 'New document available',
          content: 'Your monthly statement is ready for download.',
          sentBy: 'system',
          sentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          status: 'delivered'
        }
      ]);
      
      const response = await request(app)
        .get(`/api/portal/customers/${testCustomer._id}/communications`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('communications');
      expect(response.body.communications.length).toBeGreaterThan(0);
      expect(response.body.communications[0]).toHaveProperty('type');
      expect(response.body.communications[0]).toHaveProperty('subject');
      expect(response.body.communications[0]).toHaveProperty('sentDate');
    });
  });
  
  describe('Self-Service Features', () => {
    test('should allow customers to manage their profile', async () => {
      const profileUpdate = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0199',
        jobTitle: 'Finance Manager',
        department: 'Finance',
        preferences: {
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            sms: true,
            push: false
          },
          dashboard: {
            defaultView: 'documents',
            itemsPerPage: 25
          }
        }
      };
      
      const response = await request(app)
        .put(`/api/portal/profile`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(profileUpdate)
        .expect(200);
      
      expect(response.body).toMatchObject({
        firstName: profileUpdate.firstName,
        lastName: profileUpdate.lastName,
        phone: profileUpdate.phone,
        preferences: profileUpdate.preferences
      });
    });
    
    test('should handle password change with security validation', async () => {
      const passwordChangeData = {
        currentPassword: 'SecurePass123!',
        newPassword: 'NewSecurePass456!',
        confirmPassword: 'NewSecurePass456!'
      };
      
      const response = await request(app)
        .post('/api/portal/profile/change-password')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(passwordChangeData)
        .expect(200);
      
      expect(response.body.message).toBe('Password changed successfully');
      
      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/portal/auth/login')
        .send({
          portalId: testPortal._id,
          username: 'acme_user',
          password: 'NewSecurePass456!'
        })
        .expect(200);
      
      expect(loginResponse.body).toHaveProperty('token');
    });
    
    test('should handle password reset with email verification', async () => {
      const resetRequest = {
        email: 'user@acme.com',
        portalId: testPortal._id
      };
      
      const response = await request(app)
        .post('/api/portal/auth/forgot-password')
        .send(resetRequest)
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Password reset instructions sent to email');
      expect(response.body).toHaveProperty('resetToken'); // In real implementation, this would be sent via email
      
      // Verify reset token (in real implementation, this would be validated via email link)
      const resetToken = response.body.resetToken;
      const resetData = {
        token: resetToken,
        newPassword: 'ResetPassword789!',
        confirmPassword: 'ResetPassword789!'
      };
      
      const resetResponse = await request(app)
        .post('/api/portal/auth/reset-password')
        .send(resetData)
        .expect(200);
      
      expect(resetResponse.body.message).toBe('Password reset successfully');
    });
    
    test('should track customer activity and usage analytics', async () => {
      const activityData = {
        portalId: testPortal._id,
        customerId: testCustomer._id,
        userId: 'acme_user',
        action: 'document_download',
        resource: 'invoice',
        resourceId: testDocument._id.toString(),
        timestamp: new Date(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        metadata: {
          fileSize: 245760,
          downloadTime: 2.3
        }
      };
      
      const response = await request(app)
        .post('/api/portal/analytics/activity')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(activityData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        action: activityData.action,
        resource: activityData.resource,
        timestamp: expect.any(Date)
      });
      
      // Generate customer usage report
      const reportResponse = await request(app)
        .get(`/api/portal/analytics/customers/${testCustomer._id}/usage`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(reportResponse.body).toHaveProperty('totalSessions');
      expect(reportResponse.body).toHaveProperty('documentsAccessed');
      expect(reportResponse.body).toHaveProperty('averageSessionDuration');
      expect(reportResponse.body).toHaveProperty('mostAccessedCategories');
    });
  });
  
  describe('Performance & Security', () => {
    test('should enforce security headers and HTTPS', async () => {
      const response = await request(app)
        .get('/api/portal/portals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
    
    test('should handle rate limiting for API requests', async () => {
      const requests = Array.from({ length: 100 }, (_, i) => 
        request(app)
          .get('/api/portal/documents')
          .set('Authorization', `Bearer ${customerToken}`)
      );
      
      const responses = await Promise.all(requests);
      
      // First 50 requests should succeed
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThanOrEqual(50);
      
      // Some requests should be rate limited
      const rateLimitedCount = responses.filter(r => r.status === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    });
    
    test('should sanitize user inputs and prevent XSS', async () => {
      const maliciousInputs = [
        { name: '<script>alert("xss")</script>Document' },
        { description: "'; DROP TABLE portal_documents; --" },
        { subject: '{{constructor.constructor(\'return process\')()}}' }
      ];
      
      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/api/portal/documents')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            portalId: testPortal._id,
            category: 'general',
            ...input
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors.length).toBeGreaterThan(0);
      }
    });
    
    test('should handle large file uploads with chunking', async () => {
      const uploadConfig = {
        maxFileSize: 100 * 1024 * 1024, // 100MB
        chunkSize: 1024 * 1024, // 1MB chunks
        allowedTypes: ['pdf', 'xlsx', 'docx'],
        virusScan: true,
        thumbnailGeneration: true
      };
      
      // Test upload initiation
      const initResponse = await request(app)
        .post('/api/portal/documents/upload-init')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          fileName: 'large_document.pdf',
          fileSize: 50000000, // 50MB
          fileType: 'application/pdf',
          uploadConfig: uploadConfig
        })
        .expect(200);
      
      expect(initResponse.body).toHaveProperty('uploadId');
      expect(initResponse.body).toHaveProperty('chunkSize');
      expect(initResponse.body).toHaveProperty('totalChunks');
      
      // Simulate chunk uploads
      const uploadId = initResponse.body.uploadId;
      const totalChunks = initResponse.body.totalChunks;
      
      for (let i = 0; i < Math.min(totalChunks, 5); i++) { // Upload first 5 chunks
        const chunkResponse = await request(app)
          .post(`/api/portal/documents/upload-chunk/${uploadId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            chunkIndex: i,
            chunkData: `chunk_${i}_data`,
            checksum: `checksum_${i}`
          })
          .expect(200);
        
        expect(chunkResponse.body.chunkUploaded).toBe(true);
      }
      
      // Complete upload
      const completeResponse = await request(app)
        .post(`/api/portal/documents/upload-complete/${uploadId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          totalChunks: totalChunks,
          finalChecksum: 'final_checksum_123'
        })
        .expect(200);
      
      expect(completeResponse.body.uploadComplete).toBe(true);
      expect(completeResponse.body.documentId).toBeDefined();
    });
  });
  
  describe('Integration & API Management', () => {
    test('should provide RESTful API for portal management', async () => {
      const apiEndpoints = [
        { method: 'GET', path: '/api/portal/portals', description: 'List all portals' },
        { method: 'POST', path: '/api/portal/portals', description: 'Create new portal' },
        { method: 'GET', path: `/api/portal/portals/${testPortal._id}`, description: 'Get portal details' },
        { method: 'PUT', path: `/api/portal/portals/${testPortal._id}`, description: 'Update portal' },
        { method: 'DELETE', path: `/api/portal/portals/${testPortal._id}`, description: 'Delete portal' }
      ];
      
      for (const endpoint of apiEndpoints) {
        const response = await request(app)
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', `Bearer ${authToken}`)
          .send(endpoint.method === 'POST' || endpoint.method === 'PUT' ? {
            name: 'Test Portal Update',
            description: 'Updated portal description'
          } : {})
          .expect([200, 201]); // Some endpoints return 201 for creation
        
        expect(response.status).toBeLessThan(400);
      }
    });
    
    test('should generate API documentation', async () => {
      const response = await request(app)
        .get(`/api/portal/portals/${testPortal._id}/api-docs`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('paths');
      expect(response.body.paths).toHaveProperty('/documents');
      expect(response.body.paths).toHaveProperty('/support/tickets');
    });
    
    test('should handle webhook integrations', async () => {
      const webhookConfig = {
        portalId: testPortal._id,
        name: 'Document Upload Notification',
        url: 'https://api.acme.com/webhooks/documents',
        events: ['document.uploaded', 'document.downloaded', 'ticket.created'],
        secret: 'webhook_secret_123',
        active: true,
        retryPolicy: {
          maxRetries: 3,
          retryDelay: 5000,
          backoffMultiplier: 2
        }
      };
      
      const response = await request(app)
        .post('/api/portal/webhooks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(webhookConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        portalId: testPortal._id.toString(),
        name: webhookConfig.name,
        events: webhookConfig.events,
        active: webhookConfig.active
      });
      
      // Test webhook delivery
      const webhookEvent = {
        event: 'document.uploaded',
        portalId: testPortal._id.toString(),
        data: {
          documentId: testDocument._id.toString(),
          documentName: testDocument.name,
          uploadedBy: 'customer'
        },
        timestamp: new Date().toISOString()
      };
      
      const deliveryResponse = await request(app)
        .post(`/api/portal/webhooks/${response.body._id}/test`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(webhookEvent)
        .expect(200);
      
      expect(deliveryResponse.body.delivered).toBe(true);
      expect(deliveryResponse.body.responseStatus).toBe(200);
    });
  });
  
  describe('Error Handling & Edge Cases', () => {
    test('should handle missing portal configuration gracefully', async () => {
      const invalidPortalId = 'invalid_portal_id';
      
      const response = await request(app)
        .get(`/api/portal/portals/${invalidPortalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Portal not found');
    });
    
    test('should handle customer access restrictions', async () => {
      // Create restricted portal
      const restrictedPortal = await Portal.create({
        name: 'Restricted Portal',
        customerId: testCustomer._id,
        accessRestrictions: {
          ipWhitelist: ['192.168.1.0/24'],
          allowedDomains: ['restricted.com'],
          requireMFA: true,
          sessionTimeout: 1800 // 30 minutes
        },
        status: 'active'
      });
      
      // Test access with wrong IP (simulation)
      const response = await request(app)
        .get(`/api/portal/portals/${restrictedPortal._id}/dashboard`)
        .set('Authorization', `Bearer ${customerToken}`)
        .set('X-Forwarded-For', '10.0.0.1') // Wrong IP range
        .expect(403);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Access denied from this location');
    });
    
    test('should handle database connection failures', async () => {
      // Simulate database connection failure
      await mongoose.connection.close();
      
      const response = await request(app)
        .get('/api/portal/portals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(503);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Service temporarily unavailable');
    });
    
    test('should handle concurrent portal updates', async () => {
      const update1 = { name: 'Updated Portal Name 1', description: 'Updated by user 1' };
      const update2 = { name: 'Updated Portal Name 2', description: 'Updated by user 2' };
      
      // Simulate concurrent updates
      const [response1, response2] = await Promise.all([
        request(app)
          .put(`/api/portal/portals/${testPortal._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update1),
        request(app)
          .put(`/api/portal/portals/${testPortal._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update2)
      ]);
      
      // Both updates should succeed, but last one wins
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Verify the final state
      const finalResponse = await request(app)
        .get(`/api/portal/portals/${testPortal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(finalResponse.body.name).toBe(update2.name);
    });
  });
});

// Mock models for testing
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  permissions: [String],
  companyId: String
}));

const Customer = mongoose.model('Customer', new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  companyType: String,
  industry: String,
  registrationNumber: String,
  taxId: String,
  status: String,
  onboardingStatus: String,
  portalAccess: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

const Portal = mongoose.model('Portal', new mongoose.Schema({
  name: String,
  description: String,
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  domain: String,
  theme: mongoose.Schema.Types.Mixed,
  navigation: mongoose.Schema.Types.Mixed,
  features: mongoose.Schema.Types.Mixed,
  security: mongoose.Schema.Types.Mixed,
  integrations: mongoose.Schema.Types.Mixed,
  status: String,
  published: Boolean,
  launchDate: Date,
  tier: String,
  whiteLabel: Boolean,
  accessRestrictions: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

const PortalUser = mongoose.model('PortalUser', new mongoose.Schema({
  portalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portal' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  username: String,
  email: String,
  password: String,
  role: String,
  permissions: [String],
  status: String,
  mfaEnabled: Boolean,
  lastLogin: Date,
  preferences: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
}));

const PortalDocument = mongoose.model('PortalDocument', new mongoose.Schema({
  portalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portal' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  category: String,
  name: String,
  description: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  uploadedBy: String,
  uploadDate: Date,
  expiryDate: Date,
  status: String,
  visibility: String,
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed,
  version: Number,
  isLatest: Boolean,
  originalDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'PortalDocument' },
  downloadCount: Number,
  lastAccessed: Date,
  changeLog: String,
  accessLog: [mongoose.Schema.Types.Mixed]
}));

const PortalCommunication = mongoose.model('PortalCommunication', new mongoose.Schema({
  portalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portal' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  type: String,
  subject: String,
  content: String,
  sentBy: String,
  sentDate: Date,
  status: String,
  readDate: Date,
  metadata: mongoose.Schema.Types.Mixed
}));

const PortalTicket = mongoose.model('PortalTicket', new mongoose.Schema({
  portalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portal' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  category: String,
  priority: String,
  subject: String,
  description: String,
  attachments: [mongoose.Schema.Types.Mixed],
  status: String,
  ticketNumber: String,
  assignee: String,
  resolution: String,
  requestedResolution: String,
  urgencyLevel: String,
  slaDeadline: Date,
  updateHistory: [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

const PortalSession = mongoose.model('PortalSession', new mongoose.Schema({
  portalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portal' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  userId: String,
  sessionToken: String,
  ipAddress: String,
  userAgent: String,
  startTime: Date,
  lastActivity: Date,
  expiryTime: Date,
  isActive: Boolean
}));