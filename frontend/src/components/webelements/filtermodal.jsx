import Modal from 'react-bootstrap/Modal';
import Filters from '../Filters';

function FilterModal(props) {

    const applyFilter = async (selectedFilters, graphId, graph) => {
		props.data.update_graph(selectedFilters, graphId, graph)
	};
    return (
        <Modal show={props.show} onHide={() => { }} className='filtermodal'>
            <Modal.Body>
                <Filters filters={props.data.chart["filters"]} graph={props.data.graph} page="charts" graphId={props.data.chart.id} chart={props.data.chart} task_id={props.data.task_id} applyFilter={applyFilter} />
            </Modal.Body>
        </Modal>
    );
}

export default FilterModal;