import React from 'react';
import { Button, Card, CardContent, CardActions, Typography, Container } from "@mui/material";

const OptionCardAnchor = (props: any) => {

    return (
        <Card>
            <CardContent>
                <Typography sx={{ fontSize: 20 }}>
                    {props.description}
                </Typography>
            </CardContent>
            <CardActions>
                <a href="https://github.com/MacePapaCrypto/BoilerplateERC721">
                    <Button size="small">{props.buttonWords}</Button>
                </a>
            </CardActions>
        </Card>
    );
}

export default OptionCardAnchor;