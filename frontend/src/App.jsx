import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import NarravanceNavbar from './components/NarravanceNavbar';
import {Container} from 'react-bootstrap';
import CreateTask from './components/CreateTask';
import TaskTable from './components/TaskHome';
import FileUpload from './components/uploadfile/FileUpload';
import FileMetadata from './components/uploadfile/FileMetadata';
import Task from './Task';
import NarravanceFooter from './components/NarravancaFooter';

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <NarravanceNavbar />
        <Container className='bodyCont flex-grow-1'>
          <Routes>
            <Route path="/" element={<TaskTable />}/>
            <Route path="/createtask" element={<CreateTask />} />
            <Route path="/task" element={<Task />} />
            <Route path="/upload" element={<FileUpload />} />
            <Route path="/file/metadata" element={<FileMetadata />} />
          </Routes>
        </Container>
        <NarravanceFooter />
      </div>
    </Router>
  );
}

export default App;