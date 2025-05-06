import { Game } from '@shared/schema';

// Define the API response types based on the GameMonetize API
interface GameMonetizeGame {
  gametitle: string;
  gamethumb: string;
  gamelink: string;
  description: string;
  gamecategory: string;
  gameId: string;
  [key: string]: any;
}

interface GameMonetizeResponse {
  success: boolean;
  data: GameMonetizeGame[];
  message?: string;
}

// Convert GameMonetize API response to our Game schema format
export function transformGameMonetizeData(apiGame: GameMonetizeGame): Partial<Game> {
  return {
    title: apiGame.gametitle,
    description: apiGame.description || 'No description available',
    thumbnail: apiGame.gamethumb,
    url: apiGame.gamelink,
    apiId: apiGame.gameId,
    category: apiGame.gamecategory,
    tags: [apiGame.gamecategory], // Use category as a tag initially
    source: 'api' as const,
    status: 'active' as const,
  };
}

// Function to fetch games from GameMonetize API
export async function fetchGameMonetizeGames(
  apiKey: string,
  options: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<GameMonetizeResponse> {
  try {
    // Set up the API endpoint
    const endpoint = 'https://api.gamemonetize.com/api';
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('key', apiKey);
    
    if (options.category) {
      params.append('category', options.category);
    }
    
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    
    if (options.offset) {
      params.append('offset', options.offset.toString());
    }
    
    // Make the API request
    const response = await fetch(`${endpoint}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as GameMonetizeResponse;
  } catch (error) {
    console.error('Error fetching GameMonetize games:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to get game categories from GameMonetize API
export async function fetchGameMonetizeCategories(apiKey: string): Promise<string[]> {
  try {
    const endpoint = 'https://api.gamemonetize.com/api/categories';
    const params = new URLSearchParams();
    params.append('key', apiKey);
    
    const response = await fetch(`${endpoint}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && Array.isArray(data.data)) {
      return data.data.map((category: { name: string }) => category.name);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching GameMonetize categories:', error);
    return [];
  }
}

// Function to get a specific game by ID from GameMonetize API
export async function fetchGameMonetizeGameById(apiKey: string, gameId: string): Promise<GameMonetizeGame | null> {
  try {
    const endpoint = 'https://api.gamemonetize.com/api/game';
    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('id', gameId);
    
    const response = await fetch(`${endpoint}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching GameMonetize game by ID:', error);
    return null;
  }
}
