import React from 'react';
import { Button, Card, CardContent, CardActions, Typography, Container } from "@mui/material";

const OptionCardAnchor = (props: any) => {



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
                    <a href="https://github.com/MacePapaCrypto/BoilerplateERC721">
                        <Button size="small">{props.buttonWords}</Button>
                    </a>
                </CardActions>
            </Card>
        </Container>
    );
}

export default OptionCardAnchor;