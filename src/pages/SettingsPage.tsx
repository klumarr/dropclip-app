import React, { useState } from "react";
import { Box, Typography, Tabs, Tab, Paper } from "@mui/material";
import { AuthenticationEnhancement } from "../components/auth/AuthenticationEnhancement";
import { ProfileAnalytics } from "../components/analytics/ProfileAnalytics";
import { useAuth } from "../contexts/AuthContext";
import type { SecuritySettings } from "../types/auth.types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { user, updateSecuritySettings, toggleTwoFactor, generateBackupCodes } =
    useAuth();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      // Implement social login logic here
      console.log(`Social login with ${provider}`);
    } catch (error) {
      console.error(`Social login error with ${provider}:`, error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="settings tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Security & Privacy" />
          <Tab label="Analytics" />
          <Tab label="Notifications" />
          <Tab label="Account" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <AuthenticationEnhancement
            userId={user.id}
            securitySettings={user.securitySettings}
            onToggleTwoFactor={toggleTwoFactor}
            onUpdateSecuritySettings={updateSecuritySettings}
            onSocialLogin={handleSocialLogin}
            onGenerateBackupCodes={generateBackupCodes}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ProfileAnalytics
            userId={user.id}
            userType={user.userType}
            creativeCategory={user.creativeCategory}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Add notification settings here */}
          <Typography variant="body1" color="textSecondary">
            Notification settings coming soon...
          </Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* Add account settings here */}
          <Typography variant="body1" color="textSecondary">
            Account settings coming soon...
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
};
