import { Container, Navbar } from 'react-bootstrap';


function NarravanceNavbar(props) {

    return (
        <Navbar className="bg-dark text-light py-3 mt-auto">
            <Container>
                <Navbar.Brand className="text-light" style={{"width": "33.33%"}}>Narravance</Navbar.Brand>
                <div className="d-none d-lg-block" style={{"width": "33.33%", "textAlign": "center"}}>
                    <span className="text-light">Full Stack Developer Position</span>
                </div>
                <span className="text-light" style={{"width": "33.33%", "textAlign": "end"}}>Venkata Krishna Phani Sri Harsha Nutalapati</span>
            </Container>
        </Navbar>
    )
}

export default NarravanceNavbar;