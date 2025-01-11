import InstagramService from "../services/instagram";

// Replace these with your actual Instagram app credentials
const instagramConfig = {
  clientId: process.env.REACT_APP_INSTAGRAM_CLIENT_ID || "",
  clientSecret: process.env.REACT_APP_INSTAGRAM_CLIENT_SECRET || "",
  redirectUri:
    process.env.REACT_APP_INSTAGRAM_REDIRECT_URI ||
    "http://localhost:3000/events",
};

// Initialize the Instagram service
InstagramService.initialize(instagramConfig);

export default instagramConfig;
