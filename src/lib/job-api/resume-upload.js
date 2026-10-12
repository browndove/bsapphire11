import {
  RESUME_MAX_BYTES,
  acceptStringForPurpose,
  formatFileSize,
  isAllowedUploadFile,
  validationErrorForPurpose,
} from './file-upload';

export { RESUME_MAX_BYTES };
export const RESUME_ACCEPT = acceptStringForPurpose('resume');

export const isAllowedResume = (file) => isAllowedUploadFile(file, 'resume');
export const formatResumeSize = formatFileSize;

export { validationErrorForPurpose };
