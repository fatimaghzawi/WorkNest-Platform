import { isAxiosError } from 'axios';
import type { ApiError } from '../types/auth';

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (isAxiosError<ApiError>(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. Please check your connection and try again.';
    }

    const data = error.response?.data;
    if (data?.errors?.length) {
      return data.errors.map((e) => e.message).join(' ');
    }
    if (data?.message) {
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
