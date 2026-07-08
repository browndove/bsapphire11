import {
  FILE_MAX_BYTES,
  acceptStringForPurpose,
  formatFileSize,
  isAllowedUploadFile,
  validationErrorForPurpose,
} from './file-upload';

export const RESUME_MAX_BYTES = FILE_MAX_BYTES;
export const RESUME_ACCEPT = acceptStringForPurpose('resume');

export const isAllowedResume = (file) => isAllowedUploadFile(file, 'resume');
export const formatResumeSize = formatFileSize;

export { validationErrorForPurpose };
