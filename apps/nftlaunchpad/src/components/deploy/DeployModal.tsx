import * as React from 'react';
import { Dialog, Box, Typography } from '@mui/material';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const DeployModal = () => {

  const [open, setOpen] = React.useState(true);
  const handleClose = (props) => {
    setOpen(false);
    props.pushPath(`/deploy`);
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Welcome to the NFT Deployment Module!
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            As you move through these modals, we will prompt you to select features for a comprehensive NFT deployment, set to your standards.
          </Typography>
        </Box>
      </Dialog>
    </div>
  );
}

export default DeployModal;