import * as React from 'react';
import { Button, Box, Typography, Container, Step, Stepper, StepLabel } from '@mui/material';
import { useParams, Route } from '@moonup/ui';
import ContractInfoForm from './ContractInfoForm';
import MetadataInfoForm from './MetadataInfoForm';
import ImageInfoForm from './ImageInfoForm';
import ContractDeployed from './ContractDeployed';

const DeploySteps = (props = {}) => {

  const { id } = useParams();

  const steps = ['Start', 'Set Contract', 'Set Metadata', 'Upload Layers'];

  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const isStepOptional = (step: number) => {
    return false;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    props.pushPath(`/deploy/${activeStep+1}`);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    props.pushPath(`/deploy/${activeStep-1}`);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
    props.pushPath('/deploy/0');
  };

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
        
        <Route path="/deploy/0">
          <h1>Welcome to Contract Creation</h1>
          <h4>Press the button to start your journey.</h4>
        </Route>
        <Route path="/deploy/1">
          <ContractInfoForm { ...props }/>
        </Route>
        <Route path="/deploy/2">
          <MetadataInfoForm { ...props }/>
        </Route>
        <Route path="/deploy/3">
          <ImageInfoForm { ...props }/>
        </Route>
        <Route path="/deploy/4">
          <ContractDeployed { ...props }/>
        </Route>

        <Container sx={ {
          position: 'fixed',
          bottom: 0,
          marginBottom: '1rem',
          width: '75%'
        } } >
          <Stepper activeStep={activeStep} >
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
              } = {};
              if (isStepOptional(index)) {
                labelProps.optional = (
                  <Typography variant="caption">Optional</Typography>
                );
              }
              if (isStepSkipped(index)) {
                stepProps.completed = false;
              }
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {activeStep === steps.length ? (
            <React.Fragment>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={handleReset}>Reset</Button>
              </Box>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {isStepOptional(activeStep) && (
                  <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                    Skip
                  </Button>
                )}
                <Button onClick={handleNext}>
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Container>


    </Container>
  );
}

export default DeploySteps;
