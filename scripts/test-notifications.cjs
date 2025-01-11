const { Amplify } = require("aws-amplify");
const { fetchAuthSession, signIn } = require("@aws-amplify/auth");
const { notificationService } = require("../src/services/notification.service");
const { NotificationType } = require("../src/types/notification.types");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const requiredEnvVars = [
  "VITE_USER_POOL_ID",
  "VITE_USER_POOL_CLIENT_ID",
  "VITE_AWS_IDENTITY_POOL_ID",
  "VITE_COGNITO_DOMAIN",
  "VITE_REDIRECT_SIGN_IN",
  "VITE_REDIRECT_SIGN_OUT",
  "TEST_USER_EMAIL",
  "TEST_USER_PASSWORD",
];

// Check for required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Configure Amplify with required environment variables
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.VITE_USER_POOL_ID,
      userPoolClientId: process.env.VITE_USER_POOL_CLIENT_ID,
      identityPoolId: process.env.VITE_AWS_IDENTITY_POOL_ID,
      signUpVerificationMethod: "code",
      loginWith: {
        oauth: {
          domain: process.env.VITE_COGNITO_DOMAIN,
          scopes: ["email", "openid", "profile"],
          responseType: "code",
          redirectSignIn: [process.env.VITE_REDIRECT_SIGN_IN],
          redirectSignOut: [process.env.VITE_REDIRECT_SIGN_OUT],
        },
      },
    },
  },
};

// Test user ID - replace with an actual test user ID from your system
const TEST_USER_ID = "test_user_123";

async function testNotificationFlow() {
  console.log("Starting notification service test...");

  try {
    // 1. Create a notification
    console.log("\nCreating test notification...");
    const newNotification = await notificationService.createNotification({
      userId: TEST_USER_ID,
      type: NotificationType.SYSTEM,
      status: "unread",
      message: "Test notification message",
      metadata: {
        testKey: "testValue",
      },
    });
    console.log("Created notification:", newNotification);

    // 2. Get notifications for user
    console.log("\nFetching notifications...");
    const notifications = await notificationService.getNotifications(
      TEST_USER_ID
    );
    console.log("Retrieved notifications:", notifications);

    // 3. Get unread count
    console.log("\nGetting unread count...");
    const unreadCount = await notificationService.getUnreadCount(TEST_USER_ID);
    console.log("Unread count:", unreadCount);

    // 4. Mark notification as read
    console.log("\nMarking notification as read...");
    await notificationService.markAsRead(TEST_USER_ID, newNotification.id);

    // 5. Verify status change
    console.log("\nVerifying status change...");
    const updatedNotifications = await notificationService.getNotifications(
      TEST_USER_ID
    );
    console.log("Updated notifications:", updatedNotifications);

    // 6. Test grouped notifications
    console.log("\nTesting grouped notifications...");
    await notificationService.createGroupedNotification(
      TEST_USER_ID,
      NotificationType.UPLOAD_COMPLETE,
      "New upload completed",
      { eventId: "test_event_123" }
    );
    await notificationService.createGroupedNotification(
      TEST_USER_ID,
      NotificationType.UPLOAD_COMPLETE,
      "New upload completed",
      { eventId: "test_event_123" }
    );

    const finalNotifications = await notificationService.getNotifications(
      TEST_USER_ID
    );
    console.log("Final notifications (after grouping):", finalNotifications);

    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}

async function runTest() {
  try {
    // Configure Amplify
    Amplify.configure(amplifyConfig);

    // Sign in with test user
    await signIn({
      username: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
    });

    // Get session to verify authentication
    const session = await fetchAuthSession();
    console.log(
      "Authentication successful:",
      session.tokens?.idToken?.toString()
    );

    // Run the notification tests
    await testNotificationFlow();

    console.log("All tests completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

runTest();
