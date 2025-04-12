import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Form, Card, Table, Row } from 'react-bootstrap';
import fetchData from '../api';
import LoadingSpinner from '../webelements/loading';
import ErrorModal from '../webelements/error';
import NarravanceButton from '../NarravanceButton';

const FileMetadata = () => {
	const [loading, setLoading] = useState(false);
	const [showError, setShowError] = useState(false);
	const [error, setError] = useState("");
	const location = useLocation();
	const navigate = useNavigate();
	const { source_id, columns } = location.state || {};

	const [columnsMetadata, setColumnsMetadata] = useState(
		columns?.map(column => ({
			name: column,
			description: '',
			type: 'numeric'
		})) || []
	);

	const handleInputChange = (index, field, value) => {
		const updatedMetadata = [...columnsMetadata];
		updatedMetadata[index][field] = value;
		setColumnsMetadata(updatedMetadata);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const hasEmptyFields = columnsMetadata.some(
			column => !column.description || !column.type
		);

		if (hasEmptyFields) {
			setError('Please fill in all column descriptions and types.');
			setShowError(true);
			return;
		}

		try {
			setLoading(true);
			const result = await fetchData({
				url: 'savemetadata',
				method: 'POST',
				body: JSON.stringify({
					source_id,
					metadata: columnsMetadata
				})
			});
			setLoading(false);
			
			navigate('/', {
				state: {
					message: "File uploaded successfully"
				}
			});
		} catch (err) {
			setError('Failed to save file. Please try again.');
			setShowError(true);
			setLoading(false);
		}
	};

	return (
		<Container className="py-4">
			<LoadingSpinner show={loading} />
			<ErrorModal
				show={showError}
				message={error}
				onClose={() => setShowError(false)}
			/>
			<Card className="shadow-sm">
				<Card.Header as="h4" className="bg-primary text-white">
					File Column Metadata
				</Card.Header>
				<Card.Body>
					<Form onSubmit={handleSubmit}>
						<Table responsive striped bordered hover>
							<thead>
								<tr>
									<th style={{ width: '25%' }}>Column Name</th>
									<th style={{ width: '50%' }}>Description</th>
									<th style={{ width: '25%' }}>Data Type</th>
								</tr>
							</thead>
							<tbody>
								{columnsMetadata.map((column, index) => (
									<tr key={index}>
										<td className="align-middle">{column.name}</td>
										<td>
											<Form.Control
												as="textarea"
												rows={2}
												value={column.description}
												onChange={(e) => handleInputChange(index, 'description', e.target.value)}
												placeholder="Enter column description"
												required
											/>
										</td>
										<td>
											<Form.Select
												value={column.type}
												onChange={(e) => handleInputChange(index, 'type', e.target.value)}
												required
											>
												<option value="numeric">Numeric</option>
												<option value="date">Date</option>
												<option value="category">Category</option>
											</Form.Select>
										</td>
									</tr>
								))}
							</tbody>
						</Table>

						<Row className="mt-4">
							<NarravanceButton className="narravanceCreate successbtn" variant="success" btnType="submit" icon={<i className="bi bi-save"></i>} text="Save File"></NarravanceButton>
						</Row>
					</Form>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default FileMetadata;