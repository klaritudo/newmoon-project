import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import PropTypes from 'prop-types';

const SnackbarContainer = ({
  snackbarState,
  closeSnackbar
}) => {
  return (
    <Snackbar
      open={snackbarState.open}
      autoHideDuration={6000}
      onClose={closeSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={closeSnackbar} 
        severity={snackbarState.severity} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {snackbarState.message}
      </Alert>
    </Snackbar>
  );
};

SnackbarContainer.propTypes = {
  snackbarState: PropTypes.shape({
    open: PropTypes.bool.isRequired,
    message: PropTypes.string,
    severity: PropTypes.string
  }).isRequired,
  closeSnackbar: PropTypes.func.isRequired
};

export default SnackbarContainer; 