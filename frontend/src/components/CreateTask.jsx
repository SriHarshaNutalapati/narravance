import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Col, Row, Form, Dropdown, Container } from "react-bootstrap";
import Filters from "./Filters";
import fetchData from "./api";
import NarravanceButton from "./NarravanceButton";
import ChartSelectionModal from "./charts/ChartSelection";
import LoadingSpinner from "./webelements/loading";
import ErrorModal from "./webelements/error";


function CreateTask() {
    const [taskName, setTaskName] = useState("");
    const [filters, setFilters] = useState();
    const [chartRecommendations, setChartRecommendations] = useState([]);
    const [taskId, setTaskId] = useState();
    const [shorRecommendationModal, setShowRecModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const filtersRef = useRef(null);

    useEffect(() => {
        const getFilters = async () => {
            try {
                setLoading(true);
                const response = await fetchData({
                    url: "getfilters",
                    method: "POST",
                    body: JSON.stringify({
                        "srcA": "vehicle_sales.csv",
                        "srcB": "vehicle_sales.json"
                    }),
                });
                setFilters(response);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                setError(err);
                setShowError(true);
            }
        };
        getFilters();
    }, []);

    const createTask = async () => {
        if (filtersRef.current) {
            try {
                setLoading(true);
                const response = await fetchData({
                    url: "createtask",
                    method: "POST",
                    body: JSON.stringify({
                        "name": taskName,
                        "srcA": "vehicle_sales.csv",
                        "srcB": "vehicle_sales.json",
                        "filters": filtersRef.current.getSelectedFilters()
                    }),
                });

                setTaskId(response["id"]);
                getChartRecommendations();
            } catch (err) {
                setLoading(false);
                setError(err);
                setShowError(true);
            }
        }
    };

    const getChartRecommendations = async () => {
        try {
            setLoading(true);
            const response = await fetchData({
                url: "chartsuggestions",
                method: "POST",
                body: JSON.stringify({
                    "srcA": "vehicle_sales.csv",
                    "srcB": "vehicle_sales.json"
                }),
            });
            setChartRecommendations(response);
            setShowRecModal(true);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            setError(err);
            setShowError(true);
        }
    };

    const startTask = async (selectedChartRecommendations) => {
        try {
            const response = await fetchData({
                url: "starttask",
                method: "POST",
                body: JSON.stringify({
                    "task_id": taskId,
                    "chartrecommendations": selectedChartRecommendations
                }),
            });
            navigate('/', {
                state: {
                    message: "Task started successfully"
                }
            });
            setLoading(false);
        } catch (err) {
            setLoading(false);
            setError(err);
            setShowError(true);
        }
    };


    return (
        <>
            <LoadingSpinner show={loading} />
            <ErrorModal
                show={showError}
                message={error}
                onClose={() => setShowError(false)}
            />
            <Container style={{"padding": "0"}}>
                <h2 style={{"marginBottom": "20px"}}>Create Task</h2>
                <Form>
                    <Row className="align-items-center">
                        <Col xs={12} sm={12} md={12} lg={12}>
                            <Form.Group className="mb-3 d-flex align-items-center">
                                <Form.Label className="me-3 mb-0" style={{"fontWeight": "600"}}>Task Name: </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter task name"
                                    name="input"
                                    autoFocus
                                    value={taskName}
                                    style={{"width": "90%"}}
                                    onChange={(e) => setTaskName(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Container>

            <Row>
                {filters && (
                    <>
                        <Filters ref={filtersRef} filters={filters} />
                        <NarravanceButton btnClass="successbtn narravancebtn ms-auto mb-4 mt-4 applyfilterbtn" variant="success" clickHandler={createTask} text="Apply Filters"></NarravanceButton>
                    </>
                )}
            </Row>

            <ChartSelectionModal show={shorRecommendationModal} onHide={startTask} chartRecommendations={chartRecommendations} />

        </>
    )
}

export default CreateTask;