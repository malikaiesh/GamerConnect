import { Request, Response } from 'express';
import { storage } from '../storage';

/**
 * Helper function to get payment gateway API keys and merge with gateway configuration
 * This connects the API Keys system with Payment Gateway functionality
 */
export async function getPaymentGatewayApiKeys(gatewayType: string) {
  try {
    // Fetch API key for the specific payment gateway type
    const apiKey = await storage.getApiKeyByType(gatewayType);
    
    if (!apiKey || !apiKey.isActive) {
      console.log(`No active API key found for gateway type: ${gatewayType}`);
      return null;
    }

    console.log(`Found active API key for ${gatewayType}: ${apiKey.name}`);
    return {
      key: apiKey.key,
      name: apiKey.name,
      description: apiKey.description,
      isActive: apiKey.isActive
    };
  } catch (error) {
    console.error(`Error fetching API key for ${gatewayType}:`, error);
    return null;
  }
}

/**
 * Get payment gateway configuration with API keys
 * This endpoint provides payment gateways with their associated API keys
 */
export async function getPaymentGatewaysWithApiKeys(req: Request, res: Response) {
  try {
    // Get all payment gateways
    const gateways = await storage.getPaymentGateways();
    
    // Enhance each gateway with API key information
    const gatewaysWithApiKeys = await Promise.all(
      gateways.map(async (gateway) => {
        const apiKeyData = await getPaymentGatewayApiKeys(gateway.gatewayType);
        
        return {
          ...gateway,
          hasApiKey: !!apiKeyData,
          apiKeyName: apiKeyData?.name || null,
          apiKeyActive: apiKeyData?.isActive || false,
          // Only include key for enabled gateways with active API keys
          effectiveApiKey: gateway.status === 'enabled' && apiKeyData?.isActive ? apiKeyData.key : null
        };
      })
    );

    res.json(gatewaysWithApiKeys);
  } catch (error) {
    console.error('Error fetching payment gateways with API keys:', error);
    res.status(500).json({ error: 'Failed to fetch payment gateways with API keys' });
  }
}

/**
 * Get effective configuration for a specific payment gateway
 * Returns the gateway config merged with API key if available
 */
export async function getEffectiveGatewayConfig(gatewayType: string) {
  try {
    // Get gateway configuration
    const gateway = await storage.getPaymentGatewayByType(gatewayType);
    if (!gateway) {
      throw new Error(`Payment gateway not found: ${gatewayType}`);
    }

    // Get API key
    const apiKeyData = await getPaymentGatewayApiKeys(gatewayType);
    
    // Merge API key with gateway configuration
    const effectiveConfig = {
      ...gateway,
      hasApiKey: !!apiKeyData,
      apiKeyActive: apiKeyData?.isActive || false,
      // Only provide API key if gateway is enabled and API key is active
      effectiveApiKey: gateway.status === 'enabled' && apiKeyData?.isActive ? apiKeyData.key : null,
      // Merge API key into apiConfiguration for backwards compatibility
      apiConfiguration: {
        ...gateway.apiConfiguration,
        ...(apiKeyData?.isActive && gateway.status === 'enabled' ? {
          primaryKey: apiKeyData.key,
          keyName: apiKeyData.name
        } : {})
      }
    };

    return effectiveConfig;
  } catch (error) {
    console.error(`Error getting effective config for ${gatewayType}:`, error);
    throw error;
  }
}

/**
 * Test endpoint to check if payment gateway has valid API key
 */
export async function testPaymentGatewayApiKey(req: Request, res: Response) {
  try {
    const { gatewayType } = req.params;
    
    if (!gatewayType) {
      return res.status(400).json({ error: 'Gateway type is required' });
    }

    const config = await getEffectiveGatewayConfig(gatewayType);
    
    const result = {
      gatewayType,
      gatewayName: config.displayName,
      hasApiKey: config.hasApiKey,
      apiKeyActive: config.apiKeyActive,
      gatewayEnabled: config.status === 'enabled',
      readyForPayments: config.status === 'enabled' && config.hasApiKey && config.apiKeyActive,
      effectiveConfig: {
        hasKey: !!config.effectiveApiKey,
        keyLength: config.effectiveApiKey ? config.effectiveApiKey.length : 0,
        keyPreview: config.effectiveApiKey ? 
          `${config.effectiveApiKey.substring(0, 8)}...${config.effectiveApiKey.substring(config.effectiveApiKey.length - 4)}` : 
          null
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Error testing payment gateway API key:', error);
    res.status(500).json({ error: 'Failed to test payment gateway API key' });
  }
}