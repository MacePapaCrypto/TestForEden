import React from 'react';
import { Button, Card, CardContent, CardActions, Typography } from "@mui/material";
import { Link } from '@moonup/ui';
import "./deploy.css";

const OptionCardRouter = (props: any) => {

    return (
        <div className="deployCards">
            <Card sx={{ minWidth: 275 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 20 }}>
                        {props.description}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Link to={props.buttonLink}>
                        <Button size="small">{props.buttonWords}</Button>
                    </Link>
                </CardActions>
            </Card>
        </div>
    );
}

export default OptionCardRouter;