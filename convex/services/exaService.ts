import Exa from "exa-js";

export interface ExaSearchResult {
  title: string;
  url: string;
  text?: string;
  snippet?: string;
  publishedDate?: string;
  score?: number;
  author?: string;
}

export interface ExaSearchConfig {
  query: string;
  numResults?: number;
  type?: "neural" | "keyword";
  useAutoprompt?: boolean;
  startPublishedDate?: string;
  endPublishedDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  text?: boolean | { maxCharacters?: number; includeHtmlTags?: boolean };
}

export class ExaService {
  private client: Exa;
  
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("EXA_API_KEY is required");
    }
    this.client = new Exa(apiKey);
  }
  
  async search(config: ExaSearchConfig): Promise<ExaSearchResult[]> {
    try {
      const textOption = config.text === false ? undefined : 
                        (config.text === true || config.text === undefined) ? true : 
                        config.text;
      
      const response = await this.client.searchAndContents(config.query, {
        numResults: config.numResults || 5,
        type: config.type || "neural",
        useAutoprompt: config.useAutoprompt ?? false,
        startPublishedDate: config.startPublishedDate,
        endPublishedDate: config.endPublishedDate,
        includeDomains: config.includeDomains,
        excludeDomains: config.excludeDomains,
        text: textOption,
      });
      
      return response.results.map((result: any) => ({
        title: result.title || "",
        url: result.url || "",
        text: result.text,
        snippet: result.text ? result.text.substring(0, 200) : undefined,
        publishedDate: result.publishedDate,
        score: result.score,
        author: result.author,
      }));
    } catch (error) {
      console.error("Exa search error:", error);
      throw new Error(`Exa search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async searchMultiple(configs: ExaSearchConfig[]): Promise<ExaSearchResult[][]> {
    const promises = configs.map(config => this.search(config));
    return Promise.all(promises);
  }
  
  async findSimilar(url: string, numResults: number = 5): Promise<ExaSearchResult[]> {
    try {
      const response = await this.client.findSimilarAndContents(url, {
        numResults,
        text: true,
      });
      
      return response.results.map((result: any) => ({
        title: result.title || "",
        url: result.url || "",
        text: result.text,
        snippet: result.text ? result.text.substring(0, 200) : undefined,
        publishedDate: result.publishedDate,
        score: result.score,
        author: result.author,
      }));
    } catch (error) {
      console.error("Exa find similar error:", error);
      throw new Error(`Exa find similar failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getContents(urls: string[]): Promise<ExaSearchResult[]> {
    try {
      const response = await this.client.getContents(urls, {
        text: true,
      });
      
      return response.results.map((content: any) => ({
        title: content.title || "",
        url: content.url || "",
        text: content.text,
        author: content.author,
      }));
    } catch (error) {
      console.error("Exa get contents error:", error);
      throw new Error(`Exa get contents failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export function createExaService(): ExaService {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new Error("EXA_API_KEY environment variable is not set");
  }
  return new ExaService(apiKey);
}