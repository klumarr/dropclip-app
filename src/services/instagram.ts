interface InstagramConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

class InstagramService {
  private config: InstagramConfig;
  private static instance: InstagramService;

  private constructor(config: InstagramConfig) {
    this.config = config;
  }

  static initialize(config: InstagramConfig) {
    if (!InstagramService.instance) {
      InstagramService.instance = new InstagramService(config);
    }
    return InstagramService.instance;
  }

  static getInstance(): InstagramService {
    if (!InstagramService.instance) {
      throw new Error("InstagramService must be initialized with config first");
    }
    return InstagramService.instance;
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: "user_profile,user_media",
      response_type: "code",
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: "authorization_code",
      redirect_uri: this.config.redirectUri,
      code,
    });

    const response = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        body: params,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get access token");
    }

    const data = await response.json();
    return data.access_token;
  }

  async getUserMedia(accessToken: string): Promise<any[]> {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user media");
    }

    const data = await response.json();
    return data.data;
  }

  async getMediaDetails(mediaId: string, accessToken: string): Promise<any> {
    const response = await fetch(
      `https://graph.instagram.com/${mediaId}?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch media details");
    }

    return response.json();
  }
}

export default InstagramService;
