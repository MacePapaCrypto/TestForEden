import React from 'react';
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import "./deploy.css";

const OptionCard = (props: any) => {
    function setOpacity(e: any) {
        e.target.style.opacity = 1;
    }

    return (
        <div className="deployCards">
            <Card onMouseEnter={setOpacity} sx={{ minWidth: 275, opacity: 0.1}}>
                <CardContent>
                    <Typography sx={{ fontSize: 20 }} color="grey">
                        {props.description}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small">{props.buttonWords}</Button>
                </CardActions>
            </Card>
        </div>
    );
}

export default OptionCard;