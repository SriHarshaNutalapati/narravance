import React from "react";
import { Button } from "react-bootstrap";


function NarravanceButton(props){

    return (
        <Button type={props.btnType} className={props.btnClass} variant={props.variant || "primary"} onClick={() => props.clickHandler(props.id || null)} disabled={props.isDisabled || false}>{props.icon} {props.text}</Button>
    )
}

export default NarravanceButton;