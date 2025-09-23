import { google } from 'googleapis';
import { db } from "@db";
import { 
  googleIndexingCredentials, 
  indexingRequests, 
  indexingLogs, 
  indexingSettings,
  IndexingRequest,
  InsertIndexingRequest,
  InsertIndexingLog,
  GoogleIndexingCredential 
} from '@shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export class GoogleIndexingService {
  private auth: any = null;
  private searchconsole: any = null;
  private credentials: GoogleIndexingCredential | null = null;

  async initialize(): Promise<boolean> {
    try {
      // Get active credentials from database
      const [activeCredentials] = await db
        .select()
        .from(googleIndexingCredentials)
        .where(eq(googleIndexingCredentials.isActive, true))
        .limit(1);

      if (!activeCredentials) {
        console.log('No active Google indexing credentials found');
        return false;
      }

      this.credentials = activeCredentials;

      // Set up Google Auth
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          type: 'service_account',
          project_id: activeCredentials.projectId,
          private_key_id: '', // Not stored for security
          private_key: activeCredentials.privateKey.replace(/\\n/g, '\n'),
          client_email: activeCredentials.clientEmail,
          client_id: activeCredentials.clientId,
          auth_uri: activeCredentials.authUri,
          token_uri: activeCredentials.tokenUri,
        },
        scopes: ['https://www.googleapis.com/auth/indexing']
      });

      // Initialize Search Console API
      this.searchconsole = google.searchconsole({
        version: 'v1',
        auth: this.auth
      });

      console.log('Google Indexing Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Indexing Service:', error);
      return false;
    }
  }

  async submitUrl(url: string, contentType: 'game' | 'blog_post' | 'page' | 'category', contentId: number, userId?: number): Promise<{success: boolean, message: string, requestId?: number}> {
    try {
      if (!this.auth) {
        const initialized = await this.initialize();
        if (!initialized) {
          return { success: false, message: 'Failed to initialize Google Indexing Service' };
        }
      }

      // Check quota
      const quotaCheck = await this.checkQuota();
      if (!quotaCheck.canSubmit) {
        return { success: false, message: quotaCheck.message };
      }

      // Create indexing request record
      const [request] = await db.insert(indexingRequests).values({
        url,
        contentType,
        contentId,
        status: 'pending',
        requestType: 'URL_UPDATED',
        createdBy: userId
      }).returning();

      const startTime = Date.now();
      
      try {
        // Submit to Google Indexing API
        const indexingAPI = google.indexing('v3');
        const authClient = await this.auth.getClient();
        
        const response = await indexingAPI.urlNotifications.publish({
          auth: authClient,
          requestBody: {
            url: url,
            type: 'URL_UPDATED'
          }
        });

        const duration = Date.now() - startTime;

        // Update request status
        await db.update(indexingRequests)
          .set({ 
            status: 'submitted',
            responseData: response.data,
            updatedAt: new Date()
          })
          .where(eq(indexingRequests.id, request.id));

        // Log the action
        await this.logAction(request.id, 'submit', 'submitted', 'Successfully submitted to Google', response.data, duration);

        // Update quota
        await this.updateQuotaUsage(1);

        return { 
          success: true, 
          message: 'URL successfully submitted to Google for indexing',
          requestId: request.id
        };

      } catch (error: any) {
        const duration = Date.now() - startTime;
        const errorMessage = error.message || 'Unknown error occurred';

        // Update request with error
        await db.update(indexingRequests)
          .set({ 
            status: 'failed',
            errorMessage,
            updatedAt: new Date()
          })
          .where(eq(indexingRequests.id, request.id));

        // Log the error
        await this.logAction(request.id, 'submit', 'failed', errorMessage, null, duration);

        return { 
          success: false, 
          message: `Failed to submit URL: ${errorMessage}`,
          requestId: request.id
        };
      }

    } catch (error: any) {
      console.error('Error in submitUrl:', error);
      return { success: false, message: error.message || 'Unexpected error occurred' };
    }
  }

  async submitBulkUrls(urls: {url: string, contentType: 'game' | 'blog_post' | 'page' | 'category', contentId: number}[], userId?: number): Promise<{success: boolean, results: any[], message: string}> {
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const urlData of urls) {
      const result = await this.submitUrl(urlData.url, urlData.contentType, urlData.contentId, userId);
      results.push({
        url: urlData.url,
        ...result
      });

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }

      // Add delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      success: successCount > 0,
      results,
      message: `Bulk submission completed: ${successCount} successful, ${failureCount} failed`
    };
  }

  async deleteUrl(url: string, contentId: number, userId?: number): Promise<{success: boolean, message: string}> {
    try {
      if (!this.auth) {
        const initialized = await this.initialize();
        if (!initialized) {
          return { success: false, message: 'Failed to initialize Google Indexing Service' };
        }
      }

      // Create deletion request record
      const [request] = await db.insert(indexingRequests).values({
        url,
        contentType: 'page', // Generic for deletions
        contentId,
        status: 'pending',
        requestType: 'URL_DELETED',
        createdBy: userId
      }).returning();

      const startTime = Date.now();

      try {
        const indexingAPI = google.indexing('v3');
        const authClient = await this.auth.getClient();
        
        const response = await indexingAPI.urlNotifications.publish({
          auth: authClient,
          requestBody: {
            url: url,
            type: 'URL_DELETED'
          }
        });

        const duration = Date.now() - startTime;

        await db.update(indexingRequests)
          .set({ 
            status: 'submitted',
            responseData: response.data,
            updatedAt: new Date()
          })
          .where(eq(indexingRequests.id, request.id));

        await this.logAction(request.id, 'delete', 'submitted', 'Successfully submitted deletion to Google', response.data, duration);
        await this.updateQuotaUsage(1);

        return { success: true, message: 'URL deletion successfully submitted to Google' };

      } catch (error: any) {
        const duration = Date.now() - startTime;
        const errorMessage = error.message || 'Unknown error occurred';

        await db.update(indexingRequests)
          .set({ 
            status: 'failed',
            errorMessage,
            updatedAt: new Date()
          })
          .where(eq(indexingRequests.id, request.id));

        await this.logAction(request.id, 'delete', 'failed', errorMessage, null, duration);

        return { success: false, message: `Failed to delete URL: ${errorMessage}` };
      }

    } catch (error: any) {
      console.error('Error in deleteUrl:', error);
      return { success: false, message: error.message || 'Unexpected error occurred' };
    }
  }

  async getIndexingHistory(limit: number = 100, offset: number = 0): Promise<IndexingRequest[]> {
    return await db
      .select()
      .from(indexingRequests)
      .orderBy(desc(indexingRequests.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getIndexingStats(): Promise<{
    totalRequests: number,
    successfulRequests: number,
    failedRequests: number,
    pendingRequests: number,
    quotaUsedToday: number,
    dailyQuotaLimit: number
  }> {
    const totalRequests = await db.select().from(indexingRequests);
    const successful = totalRequests.filter(r => r.status === 'submitted' || r.status === 'indexed');
    const failed = totalRequests.filter(r => r.status === 'failed');
    const pending = totalRequests.filter(r => r.status === 'pending');

    const [settings] = await db.select().from(indexingSettings).limit(1);
    
    return {
      totalRequests: totalRequests.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      pendingRequests: pending.length,
      quotaUsedToday: settings?.quotaUsedToday || 0,
      dailyQuotaLimit: settings?.dailyQuotaLimit || 200
    };
  }

  private async checkQuota(): Promise<{canSubmit: boolean, message: string}> {
    const [settings] = await db.select().from(indexingSettings).limit(1);
    
    if (!settings) {
      // Create default settings
      await db.insert(indexingSettings).values({});
      return { canSubmit: true, message: 'Quota available' };
    }

    // Check if quota needs reset (new day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(settings.lastQuotaReset);
    lastReset.setHours(0, 0, 0, 0);

    if (today.getTime() !== lastReset.getTime()) {
      // Reset daily quota
      await db.update(indexingSettings)
        .set({
          quotaUsedToday: 0,
          lastQuotaReset: new Date(),
          updatedAt: new Date()
        })
        .where(eq(indexingSettings.id, settings.id));
      
      return { canSubmit: true, message: 'Daily quota reset, submission allowed' };
    }

    if (settings.quotaUsedToday >= settings.dailyQuotaLimit) {
      return { 
        canSubmit: false, 
        message: `Daily quota limit (${settings.dailyQuotaLimit}) reached. Try again tomorrow.` 
      };
    }

    return { 
      canSubmit: true, 
      message: `Quota available: ${settings.dailyQuotaLimit - settings.quotaUsedToday} remaining` 
    };
  }

  private async updateQuotaUsage(used: number): Promise<void> {
    const [settings] = await db.select().from(indexingSettings).limit(1);
    
    if (settings) {
      await db.update(indexingSettings)
        .set({
          quotaUsedToday: settings.quotaUsedToday + used,
          updatedAt: new Date()
        })
        .where(eq(indexingSettings.id, settings.id));
    }
  }

  private async logAction(
    requestId: number, 
    action: string, 
    status: 'pending' | 'submitted' | 'indexed' | 'failed' | 'rate_limited',
    message: string, 
    responseData?: any, 
    duration?: number
  ): Promise<void> {
    await db.insert(indexingLogs).values({
      requestId,
      action,
      status,
      message,
      responseData,
      duration,
      quotaUsed: 1
    });
  }

  async saveCredentials(credentials: any): Promise<{success: boolean, message: string}> {
    try {
      // Deactivate existing credentials
      await db.update(googleIndexingCredentials)
        .set({ isActive: false, updatedAt: new Date() });

      // Insert new credentials
      await db.insert(googleIndexingCredentials).values({
        projectId: credentials.project_id,
        serviceAccountEmail: credentials.client_email,
        privateKey: credentials.private_key,
        clientEmail: credentials.client_email,
        clientId: credentials.client_id,
        authUri: credentials.auth_uri,
        tokenUri: credentials.token_uri,
        isActive: true
      });

      // Re-initialize service with new credentials
      await this.initialize();

      return { success: true, message: 'Google service account credentials saved successfully' };
    } catch (error: any) {
      console.error('Error saving credentials:', error);
      return { success: false, message: `Failed to save credentials: ${error.message}` };
    }
  }
}