import React from 'react';
import { Button, Card, CardContent, CardActions, Typography, Container } from "@mui/material";

const OptionCardRouter = (props: any) => {

    // on select
    const onSelect = (props) => {
        // set path
        props.pushPath(`/deploy/startDeploy`);
    };

    return (
        <Container sx={ {
            marginTop : '1rem',
            padding: '1rem',
            width: '50%'
        } }>
            <Card sx={{ minWidth: 275, minHeight: 150 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 20 }}>
                        {props.description}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={onSelect}>{props.buttonWords}</Button>
                </CardActions>
            </Card>
        </Container>
    );
}

export default OptionCardRouter;