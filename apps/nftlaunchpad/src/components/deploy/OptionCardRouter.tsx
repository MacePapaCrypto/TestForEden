import React from 'react';
import { Button, Card, CardContent, CardActions, Typography, Container } from "@mui/material";

const OptionCardRouter = (props = {}) => {

    return (
        <Card>
            <CardContent>
                <Typography sx={{ fontSize: 20 }}>
                    {props.description}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={ () => props.pushPath('/deploy/0') }>{props.buttonWords}</Button>
            </CardActions>
        </Card>
    );
}

export default OptionCardRouter;