import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import NarravanceButton from '../NarravanceButton';

const ChartSelectionModal = (props) => {
    const chartOptions = props.chartRecommendations;
    const [selectedCharts, setSelectedCharts] = useState([0, 1]);
    
    const handleCheckboxChange = (index) => {
        setSelectedCharts(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    const handleClose = () => {
        const selectedChartData = selectedCharts.map(index => chartOptions[index]);
        props.onHide(selectedChartData);
    };

    return (
        <Modal
            show={props.show}
            size="lg"
            centered
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Select Charts to Display</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="chart-options-container">
                    <Form>
                        {chartOptions.map((chart, index) => (
                            <Form.Check
                                key={index}
                                type="checkbox"
                                id={`chart-${index}`}
                                className="mb-3"
                                label={chart.description}
                                checked={selectedCharts.includes(index)}
                                onChange={() => handleCheckboxChange(index)}
                            />
                        ))}
                    </Form>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <NarravanceButton variant="warning" btnClass="narravancebtn warningbtn" clickHandler={handleClose} text="Start Task" isDisabled={selectedCharts.length < 2}></NarravanceButton>
            </Modal.Footer>
        </Modal>
    );
};

export default ChartSelectionModal;