import { useState, useCallback } from "react";
import {
  OperationType,
  OperationState,
} from "../components/common/OperationFeedback";

interface UseOperationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  resetOnSuccess?: boolean;
}

export const useOperation = (
  type: OperationType,
  options: UseOperationOptions = {}
) => {
  const [state, setState] = useState<OperationState>({
    loading: false,
    success: false,
    error: null,
    progress: undefined,
  });

  const reset = useCallback(() => {
    setState({
      loading: false,
      success: false,
      error: null,
      progress: undefined,
    });
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState((prev) => ({
      ...prev,
      progress,
    }));
  }, []);

  const startOperation = useCallback(() => {
    setState({
      loading: true,
      success: false,
      error: null,
      progress: undefined,
    });
  }, []);

  const completeOperation = useCallback(() => {
    setState((prev) => ({
      loading: false,
      success: true,
      error: null,
      progress: undefined,
    }));

    if (options.onSuccess) {
      options.onSuccess();
    }

    if (options.resetOnSuccess) {
      setTimeout(reset, 2000);
    }
  }, [options.onSuccess, options.resetOnSuccess, reset]);

  const failOperation = useCallback(
    (error: Error) => {
      setState({
        loading: false,
        success: false,
        error: error.message,
        progress: undefined,
      });

      if (options.onError) {
        options.onError(error);
      }
    },
    [options.onError]
  );

  const executeOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      customErrorMessage?: string
    ): Promise<T | undefined> => {
      try {
        startOperation();
        const result = await operation();
        completeOperation();
        return result;
      } catch (error) {
        const errorMessage =
          customErrorMessage ||
          (error instanceof Error ? error.message : "Operation failed");
        failOperation(new Error(errorMessage));
        return undefined;
      }
    },
    [startOperation, completeOperation, failOperation]
  );

  return {
    state,
    reset,
    setProgress,
    startOperation,
    completeOperation,
    failOperation,
    executeOperation,
  };
};
