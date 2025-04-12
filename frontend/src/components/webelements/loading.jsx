import React from 'react';
import { Modal, Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ show = true }) => {
  return (
    <Modal
      show={show}
      centered
      backdrop="static"
      keyboard={false}
      contentClassName="bg-transparent border-0"
      dialogClassName="modal-dialog-centered justify-content-center"
    >
      <div className="text-center">
        <Spinner
          animation="border"
          variant="light"
          style={{ width: '3rem', height: '3rem' }}
        />
      </div>
    </Modal>
  );
};

export default LoadingSpinner;