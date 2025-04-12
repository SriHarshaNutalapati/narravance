import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

const SuccessAlert = ({
    show = false,
    message = "",
    onClose = () => {}
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [show]);

    return (
        <Alert
            variant="success"
            show={visible}
            onClose={() => {
                setVisible(false);
                onClose();
            }}
            dismissible
            className="position-fixed top-0 start-50 translate-middle-x mt-3 shadow-sm"
            style={{ zIndex: 1060, minWidth: '300px' }}
        >
            {message}
        </Alert>
    );
};

export default SuccessAlert;