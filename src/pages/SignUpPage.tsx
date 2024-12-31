import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Box,
  Divider,
} from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { UserType, CreativeCategory } from "../types/auth.types";
import type { SignUpInput } from "../types/auth.types";
import { UserTypeSelect } from "../components/auth/UserTypeSelect";
import { signInWithRedirect } from "aws-amplify/auth";
import { PageContainer } from "../components/layout/PageContainer";

const steps = ["Choose Role", "Create Account", "Verify Email"];

const SignUpPage = () => {
  console.log("SignUpPage rendering");
  const navigate = useNavigate();
  const { signUp, confirmSignUp, error, clearError, isAuthenticated } =
    useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [creativeType, setCreativeType] = useState<CreativeCategory | null>(
    null
  );
  const [customCreativeType, setCustomCreativeType] = useState<string>("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      console.log("User already authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    console.log("Current step:", activeStep);
  }, [activeStep]);

  const handleNext = () => {
    if (activeStep === 0) {
      if (!userType) {
        console.log("Cannot proceed: User type not selected");
        return;
      }
      if (userType === UserType.CREATIVE && !creativeType) {
        console.log("Cannot proceed: Creative type not selected");
        return;
      }
    }
    console.log("Moving to next step from:", activeStep);
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    console.log("Moving back from step:", activeStep);
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleUserTypeSelect = (type: UserType) => {
    console.log("Selected user type:", type);
    setUserType(type);
    if (type === UserType.FAN) {
      setCreativeType(null);
      setCustomCreativeType("");
    }
  };

  const handleCreativeTypeSelect = (type: CreativeCategory) => {
    console.log("Selected creative type:", type);
    setCreativeType(type);
    if (type !== CreativeCategory.OTHER) {
      setCustomCreativeType("");
    }
  };

  const handleCustomCreativeTypeChange = (value: string) => {
    console.log("Custom creative type:", value);
    setCustomCreativeType(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: "Google" });
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userType) return;

    setIsLoading(true);
    clearError();

    const { email, password, confirmPassword, name } = formData;

    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const signUpData: SignUpInput = {
      email,
      password,
      userType,
      creativeCategory: creativeType || undefined,
      customCategory:
        creativeType === CreativeCategory.OTHER
          ? customCreativeType
          : undefined,
    };

    try {
      await signUp(signUpData);
      handleNext(); // Move to verification step
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await confirmSignUp(formData.email, verificationCode);
      // Show success message
      alert("Email verified successfully! You can now sign in.");
      navigate("/login");
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    console.log("Rendering step:", step);
    switch (step) {
      case 0:
        console.log("Rendering UserTypeSelect with props:", {
          selectedType: userType,
          selectedCreativeType: creativeType,
          customCreativeType,
        });
        return (
          <Box sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
            <UserTypeSelect
              selectedType={userType}
              selectedCreativeType={creativeType || undefined}
              customCreativeType={customCreativeType}
              onSelect={handleUserTypeSelect}
              onCreativeTypeSelect={handleCreativeTypeSelect}
              onCustomCreativeTypeChange={handleCustomCreativeTypeChange}
            />
          </Box>
        );
      case 1:
        return (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Sign Up"}
            </Button>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              sx={{ mb: 2 }}
            >
              Sign up with Google
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box
            component="form"
            onSubmit={handleVerification}
            sx={{ textAlign: "center", mt: 2 }}
          >
            <Typography variant="h6" gutterBottom>
              Verify Your Email
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Please check your email for a verification code.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              sx={{ maxWidth: 200, mx: "auto" }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={isLoading || !verificationCode}
            >
              {isLoading ? <CircularProgress size={24} /> : "Verify"}
            </Button>
          </Box>
        );
      default:
        console.log("Invalid step:", step);
        return null;
    }
  };

  return (
    <PageContainer>
      <Typography component="h1" variant="h5" align="center">
        Sign Up for DropClip
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: { xs: 2, sm: 4 } }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" onClose={clearError}>
          {typeof error === "string"
            ? error
            : error.message || "An error occurred during sign up"}
        </Alert>
      )}

      {renderStepContent(activeStep)}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: { xs: 2, sm: 3 },
        }}
      >
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          variant="outlined"
        >
          Back
        </Button>
        {activeStep < steps.length - 1 && (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={
              activeStep === 0 &&
              (!userType || (userType === UserType.CREATIVE && !creativeType))
            }
          >
            Next
          </Button>
        )}
      </Box>

      <Box sx={{ textAlign: "center", mt: { xs: 1, sm: 2 } }}>
        <Link component={RouterLink} to="/login" variant="body2">
          Already have an account? Sign in
        </Link>
      </Box>
    </PageContainer>
  );
};

export default SignUpPage;
