import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ErrorModal = ({ show = false, message = "An error occurred. Please try again.", onClose = () => {}}) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onClose} className="narravancebtn deletebtn">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;