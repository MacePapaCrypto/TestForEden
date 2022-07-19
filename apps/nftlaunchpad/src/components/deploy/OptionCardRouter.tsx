import React from 'react';
import { Button, Card, CardContent, CardActions, Typography } from "@mui/material";
import { Link } from '@moonup/ui';
import "./deploy.css";

const OptionCardRouter = (props: any) => {

    // on select
    const onSelect = (item) => {
        // set path
        props.pushPath(`/deploy/startDeploy`);
    };

    return (
        <div className="deployCards">
            <Card sx={{ minWidth: 275 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 20 }}>
                        {props.description}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={onSelect}>{props.buttonWords}</Button>
                </CardActions>
            </Card>
        </div>
    );
}

export default OptionCardRouter;