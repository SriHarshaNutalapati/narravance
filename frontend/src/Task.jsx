import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import fetchData from './components/api';
import { Row, Col } from 'react-bootstrap';
import BarChart from './components/charts/BarChart';
import TimeSeriesChart from './components/charts/TimeSeries';
import GroupedBarChart from './components/charts/GroupedBarChart';
import LoadingSpinner from './components/webelements/loading';
import ErrorModal from './components/webelements/error';
import Filters from './components/Filters';
import FilterModal from './components/webelements/filtermodal';
import NarravanceButton from './components/NarravanceButton';

const Task = () => {
    const [charts, setCharts] = useState({ "bar": [], "grouped_bar": [], "time_series": [] });
    const [loading, setLoading] = useState(true);
    const [showError, setShowError] = useState(false);
    const [error, setError] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({});
    const location = useLocation();
    const { task_id, task_name } = location.state || {};


    useEffect(() => {
        let fetchCharts = async () => {
            try {
                const response = await fetchData({
                    url: "generatecharts",
                    method: "POST",
                    body: JSON.stringify({
                        "task_id": task_id,
                    }),
                });
                setCharts(response);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
                setShowError(true);
            }
        }
        fetchCharts();
    }, []);

    const updateGraph = async (filters, graph_id, graph_type) => {
        let fetchCharts = async () => {
            try {
                const response = await fetchData({
                    url: "applygraphfilter",
                    method: "POST",
                    body: JSON.stringify({
                        "task_id": task_id,
                        "graph_id": graph_id,
                        "filters": filters
                    }),
                });
                setCharts(prevCharts => {
                    const updatedCharts = { ...prevCharts };
                    const chartIndex = updatedCharts[graph_type].findIndex(c => c.id === response["graph_id"]);
                    if (chartIndex !== -1) {
                        updatedCharts[graph_type][chartIndex] = response["updated_graph"];
                    }

                    return updatedCharts;
                });
                setShowFilters(false);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
                setShowError(true);
            }
        }
        fetchCharts();
    }

    const showFiltersToggle = (chart, task_id, graph) => {
        setFilterData({
            "chart": chart,
            "task_id": task_id,
            "update_graph": updateGraph,
            "graph": graph
        });
        setShowFilters(!showFilters);
    };

    return (
        <Row>
            <h2 style={{"marginBottom": "3rem"}}>Task: {task_name}</h2>
            <LoadingSpinner show={loading} />
            <ErrorModal
                show={showError}
                message={error}
                onClose={() => setShowError(false)}
            />
            {charts["bar"].map(chart => (
                <Col md={6} key={chart.id} className='chartcont'>
                    <p title={chart.title} className='chartheading'>{chart.title}</p>
                    <BarChart chartData={chart} />
                    <NarravanceButton btnClass="successbtn narravancebtn" variant="success" clickHandler={() => showFiltersToggle(chart, task_id, "bar")} text="Apply Filters"></NarravanceButton>
                    {/* <Filters filters={chart["filters"]} graph="bar" page="charts" graphId={chart.id} chart={chart} task_id={task_id} update_graph={updateGraph} /> */}
                </Col>
            ))}
            {charts["time_series"].map(chart => (
                <Col md={6} key={chart.id} className='chartcont'>
                    <p title={chart.title} className='chartheading'>{chart.title}</p>
                    <TimeSeriesChart chartData={chart} />
                    <NarravanceButton btnClass="successbtn narravancebtn" variant="success" clickHandler={() => showFiltersToggle(chart, task_id, "time_series")} text="Apply Filters"></NarravanceButton>
                    {/* <Filters filters={chart["filters"]} graph="time_series" page="charts" graphId={chart.id} chart={chart} task_id={task_id} update_graph={updateGraph} /> */}
                </Col>
            ))}
            {charts["grouped_bar"].map(chart => (
                <Col md={6} key={chart.id} className='chartcont'>
                    <p title={chart.title} className='chartheading'>{chart.title}</p>
                    <GroupedBarChart chartData={chart} />
                    <NarravanceButton btnClass="successbtn narravancebtn" variant="success" clickHandler={() => showFiltersToggle(chart, task_id, "grouped_bar")} text="Apply Filters"></NarravanceButton>
                    {/* <Filters filters={chart["filters"]} graph="grouped_bar" page="charts" graphId={chart.id} chart={chart} task_id={task_id} update_graph={updateGraph} /> */}
                </Col>
            ))}
            {
                showFilters && <FilterModal data={filterData} show={showFilters} />
            }
        </Row>
    )

}
export default Task;