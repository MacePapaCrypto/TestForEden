import * as React from 'react';
import { Modal, Box, Typography, Container } from '@mui/material';
import { useParams } from '@moonup/ui';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  height: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const DeploySteps = (props = {}) => {

  const { id } = useParams();

  const [open, setOpen] = React.useState(true);
  const handleClose = () => {
    setOpen(false);
    props.pushPath(`/deploy`);
  }

  return (
    <Container sx={ {
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#282c34',
        height: '100%',
        width: '100%'
    } }>
        <h1>Deployment Step { id }</h1>
    </Container>
  );
}

export default DeploySteps;
