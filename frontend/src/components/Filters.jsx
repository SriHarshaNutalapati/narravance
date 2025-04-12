import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Container, Row, Col, Form, Card } from "react-bootstrap";
import Select from "react-select";

import NarravanceButton from "./NarravanceButton";

const Filters = forwardRef((props, ref) => {
	const [selectedFilters, setSelectedFilters] = useState({ "vehicle_sales.csv": {}, "vehicle_sales.json": {}, "time_series": {}, "bar": {}, "grouped_bar": {} });
	const [dataSourceA, setDataSourceA] = useState("vehicle_sales.csv");
	const [dataSourceB, setDataSourceB] = useState("vehicle_sales.json");



	useImperativeHandle(ref, () => ({
		getSelectedFilters: () => {
			if (dataSourceA == "") {
				selectedFilters["vehicle_sales.csv"] = {}
			}
			if (dataSourceB == "") {
				selectedFilters["vehicle_sales.json"] = {}
			}
			return selectedFilters
		},
		getSelectedDatasources: () => [dataSourceA, dataSourceB]
	}));

	const applyFilter = async () => {
		props.applyFilter(selectedFilters[props.graph], props.graphId, props.graph)
	};

	// useEffect(() => {
	// 	let filtersTemplate = {}
	// 	let sourceKeys = Object.keys(props.filters);
	// 	filtersTemplate[sourceKeys[0]] = {}
	// 	filtersTemplate[sourceKeys[1]] = {}
	// 	setSelectedFilters(filtersTemplate);
	// }, [])

	const handleCategoryChange = (selected, source, column) => {
		setSelectedFilters((prevFilters) => ({
			...prevFilters,
			[source]: {
				...prevFilters[source],
				[column]: selected.map(label => label.value)
			},
		}));
	}

	const handleNumericAndDateChange = (value, source, column, isMin, defaultVal) => {
		let rangeValue = 0;
		let target = [];
		if (isMin) {
			rangeValue = selectedFilters[source][column] ? selectedFilters[source][column][1] : defaultVal
			target = [value, rangeValue]
		} else {
			rangeValue = selectedFilters[source][column] ? selectedFilters[source][column][0] : defaultVal
			target = [rangeValue, value]
		}


		setSelectedFilters((prevFilters) => ({
			...prevFilters,
			[source]: {
				...prevFilters[source],
				[column]: target
			},
		}));
	};

	const handleDataSourceASelect = (e) => {
		if (e.target.checked) {
			setDataSourceA("vehicle_sales.csv");
		} else {
			setDataSourceA("");
		}
	};

	const handleDataSourceBSelect = (e) => {
		if (e.target.checked) {
			setDataSourceB("vehicle_sales.json");
		} else {
			setDataSourceB("");
		}
	};

	return (
		<Container>
			{!props.page && (
				<Row className="align-items-center mb-4 mt-3">
					<Col xs={12} sm={4} md={3} lg={3}>
						<span className="me-2" style={{"fontWeight": "600"}}>Select data set to be filtered:</span>
					</Col>
					<Col xs={6} sm={4} md={3} lg={3}>
						<Form.Group className="mb-0 d-inline-block me-3">
							<Form.Check
								type="checkbox"
								label="vehicles_sales.csv"
								name="checkbox1"
								style={{"fontWeight": "600"}}
								checked={dataSourceA != ""}
								onChange={handleDataSourceASelect}
								inline
							/>
						</Form.Group>
					</Col>
					<Col xs={6} sm={4} md={3} lg={3}>
						<Form.Group className="mb-0 d-inline-block">
							<Form.Check
								type="checkbox"
								label="vehicles_sales.json"
								name="checkbox2"
								style={{"fontWeight": "600"}}
								checked={dataSourceB != ""}
								onChange={handleDataSourceBSelect}
								inline
							/>
						</Form.Group>
					</Col>
				</Row>
			)}
			{Object.keys(props.filters).map((source) => {
				if (["time_series", "bar", "grouped_bar"].includes(source) || dataSourceA == source || dataSourceB == source) {
					return (
						<Card key={source} className="shadow-lg rounded-2xl p-4 mb-4">
							<Card.Body>
								<h2 className="font-bold text-2xl mb-4">Filters for {source}</h2>
								<Form>
									<Row>
										{Object.keys(props.filters[source]).map((column) => {
											let columndata = props.filters[source][column]
											return (
												<Col md={4} key={column} className="mb-3">
													<Form.Label className="fw-bold">{column}</Form.Label>
													{columndata.type == "category" ? (
														<Select
															isMulti
															name="options"
															options={columndata.values}
															onChange={(selected) => handleCategoryChange(selected, source, column)}
															getOptionLabel={(e) => e.label}
															getOptionValue={(e) => e.value}
															value={Object.keys(selectedFilters[source]).includes(column) ? selectedFilters[source][column].map(option => ({
																value: option,
																label: option
															})) : props.chart && Object.keys(props.chart["given_filters"]).includes(column) ? props.chart["given_filters"][column].map(option => ({
																value: option,
																label: option
															})) : []}
														/>
													) : columndata.type == "numerical" ? (
														<Row>
															<Col md={6} className="mb-3" style={{ "display": "flex", "alignItems": "center" }}>
																<Form.Label style={{ "margin": "0 10px 0 0" }}>Min</Form.Label>
																<Form.Control
																	type="number"
																	value={selectedFilters && selectedFilters[source][column] ? selectedFilters[source][column][0] : props.chart && props.chart["given_filters"] && props.chart["given_filters"][column] ? props.chart["given_filters"][column][0] : columndata.min}
																	min={columndata.min}
																	max={columndata.max}
																	onChange={(e) => handleNumericAndDateChange(parseInt(e.target.value), source, column, true, columndata.max)}
																/>
															</Col>
															<Col md={6} className="mb-3" style={{ "display": "flex", "alignItems": "center" }}>
																<Form.Label style={{ "margin": "0 10px 0 0" }}>Max</Form.Label>
																<Form.Control
																	type="number"
																	value={selectedFilters && selectedFilters[source][column] ? selectedFilters[source][column][1] : props.chart && props.chart["given_filters"] && props.chart["given_filters"][column] ? props.chart["given_filters"][column][1] : columndata.max}
																	min={columndata.min}
																	max={columndata.max}
																	onChange={(e) => handleNumericAndDateChange(parseInt(e.target.value), source, column, false, columndata.min)}
																/>
															</Col>
														</Row>
													) : (
														<Row>
															<Col md={6} className="mb-3" style={{ "display": "flex", "alignItems": "center" }}>
																<Form.Label style={{ "margin": "0 10px 0 0" }}>From</Form.Label>
																<Form.Control
																	type="date"
																	value={selectedFilters && selectedFilters[source][column] ? selectedFilters[source][column][0] : props.chart && props.chart["given_filters"] && props.chart["given_filters"][column] ? props.chart["given_filters"][column][0] : columndata.from}
																	min={columndata.from}
																	max={columndata.to}
																	onChange={(e) => handleNumericAndDateChange(e.target.value, source, column, true, columndata.to)}
																/>
															</Col>
															<Col md={6} className="mb-3" style={{ "display": "flex", "alignItems": "center" }}>
																<Form.Label style={{ "margin": "0 10px 0 0" }}>To</Form.Label>
																<Form.Control
																	type="date"
																	value={selectedFilters && selectedFilters[source][column] ? selectedFilters[source][column][1] : props.chart && props.chart["given_filters"] && props.chart["given_filters"][column] ? props.chart["given_filters"][column][1] : columndata.to}
																	min={columndata.from}
																	max={columndata.to}
																	onChange={(e) => handleNumericAndDateChange(e.target.value, source, column, false, columndata.from)}
																/>
															</Col>
														</Row>
													)}
												</Col>
											)
										}
										)}
									</Row>
								</Form>
							</Card.Body>
							{props.page && props.page == "charts" && (
								<Card.Footer className="d-flex justify-content-end">
									<NarravanceButton btnClass="successbtn narravancebtn" variant="success" clickHandler={applyFilter} text="Apply Filters"></NarravanceButton>
								</Card.Footer>
							)}
						</Card>
					)
				}
			})}
		</Container>
	);
});

export default Filters;
