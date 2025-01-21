import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface SignInModalContextType {
  isOpen: boolean;
  onSuccess?: () => void;
  openSignInModal: (callback?: () => void) => void;
  closeSignInModal: () => void;
  handleSuccess: () => void;
}

const SignInModalContext = createContext<SignInModalContextType | undefined>(
  undefined
);

export const SignInModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onSuccess, setOnSuccess] = useState<(() => void) | undefined>(
    undefined
  );

  const openSignInModal = useCallback((callback?: () => void) => {
    console.log("🔐 Opening sign-in modal", { callback });
    setOnSuccess(() => callback);
    setIsOpen(true);
  }, []);

  const closeSignInModal = useCallback(() => {
    console.log("🔐 Closing sign-in modal");
    setIsOpen(false);
    setOnSuccess(undefined);
  }, []);

  const handleSuccess = useCallback(() => {
    console.log("✅ Sign-in successful, executing callback");
    if (onSuccess) {
      onSuccess();
    }
    closeSignInModal();
  }, [onSuccess, closeSignInModal]);

  return (
    <SignInModalContext.Provider
      value={{
        isOpen,
        onSuccess,
        openSignInModal,
        closeSignInModal,
        handleSuccess,
      }}
    >
      {children}
    </SignInModalContext.Provider>
  );
};

export const useSignInModal = () => {
  const context = useContext(SignInModalContext);
  if (!context) {
    throw new Error("useSignInModal must be used within a SignInModalProvider");
  }
  return context;
};

export default useSignInModal;
