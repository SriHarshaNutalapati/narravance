import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Card } from 'react-bootstrap';
import fetchData from '../api'
import LoadingSpinner from '../webelements/loading';
import ErrorModal from '../webelements/error';
import NarravanceButton from '../NarravanceButton';

const FileUpload = () => {
	const [folders, setFolders] = useState([]);
	const [selectedFolder, setSelectedFolder] = useState('');
	const [fileName, setFileName] = useState('');
	const [fileDescription, setFileDescription] = useState('');
	const [file, setFile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showError, setShowError] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const getFolders = async () => {
			try {
				const data = await fetchData({
					url: 'getfolders'
				});

				setFolders(data.folders);
				setLoading(false);
			} catch (err) {
				setError('Failed to fetch folders. Please try again.');
				setShowError(true);
				setLoading(false);
			}
		};

		getFolders();
	}, []);

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			const fileType = selectedFile.name.split('.').pop().toLowerCase();
			if (fileType !== 'csv' && fileType !== 'json') {
				setError('Please upload only CSV or JSON files.');
				setShowError(true);
				setFile(null);
				e.target.value = null;
				return;
			}

			setFile(selectedFile);

			if (!fileName) {
				setFileName(selectedFile.name.split('.')[0]);
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!selectedFolder) {
			setError('Please select a folder.');
			setShowError(true);
			return;
		}

		if (!fileName) {
			setError('Please enter a file name.');
			setShowError(true);
			return;
		}

		if (!file) {
			setError('Please select a file to upload.');
			setShowError(true);
			return;
		}

		try {
			setLoading(true);

			const formData = new FormData();
			formData.append('file', file);
			formData.append('folder', selectedFolder);
			formData.append('fileName', fileName);
			formData.append('description', fileDescription);

			const data = await fetchData({
				url: 'upload',
				method: 'POST',
				headers: {},
				body: formData
			});

			if (data && data.source_id) {
				navigate('/file/metadata', {
					state: {
						source_id: data.source_id,
						columns: data.columns
					}
				});
			} else {
				setError('File upload failed. Please try again.');
				setShowError(true);
				setLoading(false);
			}
		} catch (err) {
			setError('File upload failed. Please try again.');
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
					Upload Data File
				</Card.Header>
				<Card.Body>
					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>Select Destination Folder</Form.Label>
							<Form.Select
								value={selectedFolder}
								onChange={(e) => setSelectedFolder(e.target.value)}
								required
								disabled={loading}
							>
								<option value="">-- Select Folder --</option>
								{folders.map((folder) => (
									<option key={folder} value={folder}>{folder}</option>
								))}
							</Form.Select>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Select File (CSV or JSON only)</Form.Label>
							<Form.Control
								type="file"
								accept=".csv,.json"
								onChange={handleFileChange}
								required
								disabled={loading}
							/>
							<Form.Text className="text-muted">
								Only CSV or JSON files are supported.
							</Form.Text>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>File Name</Form.Label>
							<Form.Control
								type="text"
								value={fileName}
								onChange={(e) => setFileName(e.target.value)}
								placeholder="Enter file name"
								required
								disabled={loading}
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>File Description</Form.Label>
							<Form.Control
								as="textarea"
								rows={3}
								value={fileDescription}
								onChange={(e) => setFileDescription(e.target.value)}
								placeholder="Enter a description for this file"
								disabled={loading}
							/>
						</Form.Group>

						<div className="d-grid">
							<NarravanceButton variant="info" btnType="submit" btnClass="narravancebtn infobtn" text={loading ? 'Uploading...' : 'Upload File'} isDisabled={loading}></NarravanceButton>
						</div>
					</Form>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default FileUpload;