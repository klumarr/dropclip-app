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
import { useAuth } from "../../contexts/AuthContext";
import { UserType, CreativeCategory } from "../../types/auth.types";
import type { SignUpInput } from "../../types/auth.types";
import { UserTypeSelect } from "../../components/auth/UserTypeSelect";
import { signInWithRedirect } from "aws-amplify/auth";
import { PageContainer } from "../../components/layout/PageContainer";
import { VerifyEmailForm } from "../../components/auth/VerifyEmailForm";

const steps = ["Choose Role", "Create Account", "Verify Email"];

const SignUpPage = () => {
  console.log("SignUpPage rendering");
  const navigate = useNavigate();
  const {
    signUp,
    confirmSignUp,
    signIn,
    clearError,
    error: authError,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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
      name,
      userType,
      creativeCategory: creativeType || undefined,
      customCategory:
        creativeType === CreativeCategory.OTHER
          ? customCreativeType
          : undefined,
    };

    try {
      await signUp(signUpData);
      navigate("/verify", { state: { email, password } });
      handleNext();
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
    setError(null);

    try {
      await confirmSignUp(formData.email, verificationCode);
      await signIn(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err : new Error("Verification failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    console.log("🔍 Rendering step:", step);
    switch (step) {
      case 0:
        console.log("🎯 Rendering Role Selection with props:", {
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
        console.log("🎯 Rendering Create Account Form");
        return (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 400 }}>
              <TextField
                required
                fullWidth
                placeholder="Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={handleInputChange}
                variant="outlined"
                InputProps={{
                  sx: {
                    height: 40,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                }}
                sx={{
                  mb: 2,
                  "& .MuiInputBase-input": {
                    color: "white",
                    "&::placeholder": {
                      color: "text.secondary",
                      opacity: 1,
                    },
                  },
                }}
              />
              <TextField
                required
                fullWidth
                placeholder="Email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                InputProps={{
                  sx: {
                    height: 40,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                }}
                sx={{
                  mb: 2,
                  "& .MuiInputBase-input": {
                    color: "white",
                    "&::placeholder": {
                      color: "text.secondary",
                      opacity: 1,
                    },
                  },
                }}
              />
              <TextField
                required
                fullWidth
                placeholder="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleInputChange}
                variant="outlined"
                InputProps={{
                  sx: {
                    height: 40,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                }}
                sx={{
                  mb: 2,
                  "& .MuiInputBase-input": {
                    color: "white",
                    "&::placeholder": {
                      color: "text.secondary",
                      opacity: 1,
                    },
                  },
                }}
              />
              <TextField
                required
                fullWidth
                placeholder="Confirm Password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                variant="outlined"
                InputProps={{
                  sx: {
                    height: 40,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                }}
                sx={{
                  mb: 2,
                  "& .MuiInputBase-input": {
                    color: "white",
                    "&::placeholder": {
                      color: "text.secondary",
                      opacity: 1,
                    },
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  height: "40px !important",
                  background: `linear-gradient(45deg, #9c27b0, #673ab7) !important`,
                  "&:hover": {
                    background: `linear-gradient(45deg, #7b1fa2, #512da8) !important`,
                  },
                  "&.Mui-disabled": {
                    opacity: "0.7 !important",
                    background: "rgba(255, 255, 255, 0.12) !important",
                  },
                  textTransform: "none",
                  fontSize: "0.9rem",
                  mb: 2,
                }}
              >
                {isLoading ? <CircularProgress size={20} /> : "Sign Up"}
              </Button>

              <Divider sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  OR
                </Typography>
              </Divider>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon sx={{ fontSize: 18 }} />}
                onClick={handleGoogleSignIn}
                sx={{
                  height: 40,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  textTransform: "none",
                  fontSize: "0.9rem",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  "&:hover": {
                    borderColor: "primary.main",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                  },
                }}
              >
                Continue with Google
              </Button>
            </Box>
          </Box>
        );

      case 2:
        console.log("🎯 Rendering Verify Email Form", {
          verificationCode,
          isLoading,
          error,
        });
        return (
          <Box
            sx={{
              width: "100%",
              maxWidth: 400,
              mx: "auto",
              "& .MuiButton-root": {
                height: "40px",
                background: `linear-gradient(45deg, #9c27b0, #673ab7)`,
                color: "white",
                textTransform: "none",
                fontSize: "0.9rem",
                padding: "0 16px",
                border: "none",
                "&:hover": {
                  background: `linear-gradient(45deg, #7b1fa2, #512da8)`,
                },
                "&.Mui-disabled": {
                  opacity: 0.7,
                  background: "rgba(255, 255, 255, 0.12)",
                  color: "rgba(255, 255, 255, 0.3)",
                },
              },
            }}
          >
            <VerifyEmailForm
              verificationCode={verificationCode}
              isLoading={isLoading}
              onVerificationCodeChange={(code) => {
                console.log("📝 Verification code changed:", code);
                setVerificationCode(code);
              }}
              onSubmit={handleVerification}
              onResendCode={() => {
                console.log("🔄 Resend code clicked");
                // TODO: Implement resend functionality
              }}
            />
          </Box>
        );

      default:
        console.log("❌ Invalid step:", step);
        return null;
    }
  };

  return (
    <PageContainer maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: { xs: 1.5, sm: 2 },
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: (theme) => `0 8px 32px ${theme.palette.action.hover}`,
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          maxWidth: 600,
          mx: "auto",
          width: "100%",
          mb: { xs: 7, sm: 2 },
        }}
      >
        <Typography
          component="h1"
          variant="h3"
          sx={{
            mb: 1,
            fontWeight: 700,
            background: (theme) =>
              `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            textFillColor: "transparent",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: { xs: "2rem", sm: "2.5rem" },
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          DropClip
          <Box
            component="span"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              fontWeight: 500,
              color: "primary.main",
              bgcolor: "rgba(156, 39, 176, 0.1)",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "primary.main",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Beta
          </Box>
        </Typography>

        <Typography
          component="h2"
          variant="h4"
          sx={{
            mb: 2,
            fontWeight: 600,
            background: (theme) =>
              `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            textFillColor: "transparent",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
          }}
        >
          Create Your Account
        </Typography>

        <Stepper
          activeStep={activeStep}
          sx={{
            width: "100%",
            mb: 2,
            "& .MuiStepLabel-label": {
              color: "text.secondary",
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              "&.Mui-active": {
                color: "primary.main",
                fontWeight: 600,
              },
              "&.Mui-completed": {
                color: "success.main",
              },
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {(error || authError) && (
          <Alert
            severity="error"
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              backgroundColor: "error.dark",
              color: "white",
              py: 0.5,
              "& .MuiAlert-message": {
                fontSize: "0.75rem",
              },
            }}
          >
            {(error || authError)?.message || "An error occurred"}
          </Alert>
        )}

        <Box sx={{ width: "100%" }}>{renderStepContent(activeStep)}</Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 2,
            width: "100%",
            maxWidth: 400,
            mb: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || isLoading}
            size="small"
            sx={{
              px: 2,
              "&.Mui-disabled": {
                opacity: 0,
              },
            }}
          >
            Back
          </Button>
          {activeStep < steps.length - 1 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                isLoading ||
                !userType ||
                (userType === UserType.CREATIVE && !creativeType)
              }
              size="small"
              sx={{
                px: 2,
                background: (theme) =>
                  `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                "&:hover": {
                  background: (theme) =>
                    `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
              }}
            >
              Next
            </Button>
          )}
        </Box>

        {activeStep === 1 && (
          <>
            <Divider sx={{ width: "100%", maxWidth: 400, my: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                OR
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon sx={{ fontSize: 18 }} />}
              onClick={handleGoogleSignIn}
              size="small"
              sx={{
                maxWidth: 400,
                height: 36,
                borderColor: "divider",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "action.hover",
                },
              }}
            >
              Continue with Google
            </Button>
          </>
        )}

        <Typography
          variant="body2"
          sx={{ mt: 1.5, color: "text.secondary", fontSize: "0.75rem" }}
        >
          Already have an account?{" "}
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              color: "primary.main",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default SignUpPage;
