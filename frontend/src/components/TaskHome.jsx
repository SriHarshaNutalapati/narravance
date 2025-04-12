import React, { useEffect, useState } from "react";
import { Table, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import NarravanceButton from "./NarravanceButton";
import fetchData from "./api";
import LoadingSpinner from "./webelements/loading";
import ErrorModal from "./webelements/error";
import SuccessAlert from "./webelements/alert";
import { useLocation } from 'react-router-dom';


const TaskTable = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [showError, setShowError] = useState(false);
	const [error, setError] = useState("");
	const [tasks, setTasks] = useState([]);
	const location = useLocation();


	useEffect(() => {
		const getTasks = async () => {
			try {
				setLoading(true);
				const data = await fetchData({
					url: 'gettasks'
				});
				setTasks(data);
				setLoading(false);
			} catch (err) {
				setError(err);
				setShowError(true);
				setLoading(false);
			}
		};

		getTasks();
	}, [])

	const handleDelete = async (id) => {
		const deleteTask = async () => {
			try {
				setLoading(true);
				const data = await fetchData({
					url: 'deletetask',
					method: 'POST',
					body: JSON.stringify({
						"task_id": id
					}),
				});
				setLoading(false);
				setTasks(tasks.filter(task => task.task_id !== id));
			} catch (err) {
				setError(err);
				setShowError(true);
				setLoading(false);
			}
		};

		deleteTask();

	};

	const openTask = (task_id, task_name) => {
		navigate('/task', {
			state: {
				task_id: task_id,
				task_name: task_name
			}
		});
	}

	return (
		<Container className="mt-4">
			<LoadingSpinner show={loading}/>
            <ErrorModal
                show={showError}
                message={error}
                onClose={() => setShowError(false)}
            />
			<Row className="mb-3">
				<Col>
					<h2>Tasks</h2>
				</Col>
				<Col className="text-end">
					{/* <NarravanceButton variant="warning" clickHandler={() => navigate("/upload")} icon={<i className="bi bi-upload"></i>} text="Upload File" btnClass="narravanceWarning"></NarravanceButton> */}
					<NarravanceButton variant="success" clickHandler={() => navigate("/createtask")} icon={<i className="bi bi-plus"></i>} text="New Task" btnClass="narravanceCreate"></NarravanceButton>
				</Col>
			</Row>

			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Task Name</th>
						<th>Data Source A</th>
						<th>Data Source B</th>
						<th>Date Created</th>
						<th>Task Status</th>
						{/* <th>Actions</th> */}
					</tr>
				</thead>
				<tbody>
					{tasks.length?tasks.map(task => (
						<tr key={task.task_id}>
							<td onClick={() => openTask(task.task_id, task.name)} className="text-primary cursor-pointer" style={{ textDecoration: 'underline', cursor: 'pointer' }}>{task.name}</td>
							<td>{task.srcA}</td>
							<td>{task.srcB}</td>
							<td>{task.dateCreated}</td>
							<td>{task.status}</td>
							{/* <td>
								<NarravanceButton variant="danger" clickHandler={handleDelete} id={task.task_id} icon={<i className="bi bi-trash"></i>} btnClass="narravanceDelete" isDisabled={task.status == "INPROGRESS"}></NarravanceButton>
							</td> */}
						</tr>
					)):(
						<tr>
							<td colspan="6" style={{"textAlign": "center"}}>No Tasks.</td>
						</tr>
					)}
				</tbody>
			</Table>
		</Container>
	);
};

export default TaskTable;
