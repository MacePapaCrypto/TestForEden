import { Grid, TextField } from '@mui/material';
import React from 'react';

const ContractDeployed = (props = {}) => {
    return (
        <>
            <h1>This is the contract info page</h1>
            <h4>Please fill in the information below.</h4>
            <Grid container>
                <Grid item xs={6}>
                    <TextField id="outlined-basic" label="Collection Name" />
                </Grid>
                <Grid item xs={6}>
                    <TextField id="outlined-basic" label="Collection Symbol" />
                </Grid>
                <Grid item xs={6}>
                    <TextField id="outlined-basic" label="Maximum Supply" />
                </Grid>
                <Grid item xs={6}>
                    <TextField id="outlined-basic" label="Max Per Transaction" />
                </Grid>
                <Grid item xs={6}>
                    <TextField id="outlined-basic" label="Set Royalty Address" />
                </Grid>
                <Grid item xs={6}>
                    <TextField id="outlined-basic" label="Set Royalty Percentage" />
                </Grid>
            </Grid>
        </>
    );
}

export default ContractDeployed;