import React from 'react';
import { Button, Card, CardContent, CardActions, Typography } from "@mui/material";
import "./deploy.css";

const OptionCardAnchor = (props: any) => {

    return (
        <div className="deployCards">
            <Card sx={{ minWidth: 275, opacity: 0.75}}>
                <CardContent>
                    <Typography sx={{ fontSize: 20 }} color="black">
                        {props.description}
                    </Typography>
                </CardContent>
                <CardActions>
                    <a href="https://github.com/MacePapaCrypto/BoilerplateERC721">
                        <Button size="small">{props.buttonWords}</Button>
                    </a>
                </CardActions>
            </Card>
        </div>
    );
}

export default OptionCardAnchor;