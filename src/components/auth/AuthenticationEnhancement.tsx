import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  Google as GoogleIcon,
  Twitter as TwitterIcon,
  GitHub as GitHubIcon,
  Info as InfoIcon,
  QrCode2 as QrCodeIcon,
} from "@mui/icons-material";

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  sessionTimeout: number;
  passwordLastChanged: Date;
}

export interface AuthenticationEnhancementProps {
  securitySettings: SecuritySettings;
  onToggleTwoFactor: () => Promise<void>;
  onUpdateSecuritySettings: (
    settings: Partial<SecuritySettings>
  ) => Promise<void>;
  onSocialLogin: (provider: string) => Promise<void>;
  onGenerateBackupCodes: () => Promise<string[]>;
}

export const AuthenticationEnhancement: React.FC<
  AuthenticationEnhancementProps
> = ({
  securitySettings,
  onToggleTwoFactor,
  onUpdateSecuritySettings,
  onSocialLogin,
  onGenerateBackupCodes,
}) => {
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");

  const handleTwoFactorToggle = async () => {
    if (!securitySettings.twoFactorEnabled) {
      setShowTwoFactorDialog(true);
    } else {
      await onToggleTwoFactor();
    }
  };

  const handleGenerateBackupCodes = async () => {
    const codes = await onGenerateBackupCodes();
    setBackupCodes(codes);
    setShowBackupCodesDialog(true);
  };

  const handleVerifyTwoFactor = async () => {
    if (verificationCode.length === 6) {
      try {
        await onToggleTwoFactor();
        setShowTwoFactorDialog(false);
        setVerificationCode("");
      } catch (error) {
        console.error("Error verifying 2FA:", error);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Security & Authentication
      </Typography>

      {/* Social Login Integration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Connected Accounts
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => onSocialLogin("google")}
            >
              Google
            </Button>
            <Button
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={() => onSocialLogin("facebook")}
            >
              Facebook
            </Button>
            <Button
              variant="outlined"
              startIcon={<TwitterIcon />}
              onClick={() => onSocialLogin("twitter")}
            >
              Twitter
            </Button>
            <Button
              variant="outlined"
              startIcon={<GitHubIcon />}
              onClick={() => onSocialLogin("github")}
            >
              GitHub
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Two-Factor Authentication"
                secondary="Add an extra layer of security to your account"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={securitySettings.twoFactorEnabled}
                  onChange={handleTwoFactorToggle}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Security Notifications"
                secondary="Get email alerts for important security events"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={securitySettings.emailNotifications}
                  onChange={() =>
                    onUpdateSecuritySettings({
                      emailNotifications: !securitySettings.emailNotifications,
                    })
                  }
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Session Timeout"
                secondary="Automatically log out after period of inactivity"
              />
              <ListItemSecondaryAction>
                <TextField
                  select
                  size="small"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) =>
                    onUpdateSecuritySettings({
                      sessionTimeout: Number(e.target.value),
                    })
                  }
                  SelectProps={{
                    native: true,
                  }}
                  sx={{ width: 100 }}
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </TextField>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Backup Codes"
                secondary="Generate backup codes for account recovery"
              />
              <ListItemSecondaryAction>
                <Button
                  variant="outlined"
                  onClick={handleGenerateBackupCodes}
                  startIcon={<QrCodeIcon />}
                >
                  Generate
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Password Last Changed"
                secondary={securitySettings.passwordLastChanged.toLocaleDateString()}
              />
              <ListItemSecondaryAction>
                <Tooltip title="We recommend changing your password every 90 days">
                  <IconButton size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication Dialog */}
      <Dialog
        open={showTwoFactorDialog}
        onClose={() => setShowTwoFactorDialog(false)}
      >
        <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: "center" }}>
            <QrCodeIcon sx={{ fontSize: 120, mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Scan this QR code with your authenticator app
            </Typography>
            <TextField
              fullWidth
              label="Enter Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTwoFactorDialog(false)}>Cancel</Button>
          <Button onClick={handleVerifyTwoFactor} variant="contained">
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog
        open={showBackupCodesDialog}
        onClose={() => setShowBackupCodesDialog(false)}
      >
        <DialogTitle>Backup Codes</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Save these codes in a secure place. They can be used to access your
            account if you lose your phone.
          </Alert>
          <Box
            sx={{
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
              fontFamily: "monospace",
            }}
          >
            {backupCodes.map((code, index) => (
              <Typography key={index} variant="body2">
                {code}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBackupCodesDialog(false)}>Close</Button>
          <Button variant="contained" onClick={() => window.print()}>
            Print Codes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
