// Map technical API errors to human-friendly Indian-English messages
export const friendlyError = (error: any): string => {
  const msg = error?.response?.data?.message || error?.message || '';

  const errorMap: Record<string, string> = {
    'Network Error': 'Cannot connect to server. Please check if the application is running properly.',
    'Request failed with status code 401': 'Your session has expired. Please log in again.',
    'Request failed with status code 403': 'You do not have permission to perform this action.',
    'Request failed with status code 404': 'The requested information was not found.',
    'Request failed with status code 500': 'Something went wrong. Please try again or contact support.',
    'duplicate key': 'This record already exists. Please use a different value.',
    'foreign key': 'Cannot delete this record as it is linked to other data.',
    'ECONNREFUSED': 'Database connection failed. Please restart the application.',
  };

  for (const [key, friendly] of Object.entries(errorMap)) {
    if (msg.includes(key)) return friendly;
  }

  return 'An unexpected error occurred. Please try again.';
};
