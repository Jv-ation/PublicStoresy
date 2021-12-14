'use strict';
// number of record scope must be defined outside of call to Issues()
var numRecords = 0;


//defining react bootstrap components that are used
var Navbar = ReactBootstrap.Navbar,
Nav = ReactBootstrap.Nav,
NavItem = ReactBootstrap.NavItem,
DropdownButton = ReactBootstrap.DropdownButton,
Container = ReactBootstrap.Container,
NavDropdown = ReactBootstrap.NavDropdown,
Button = ReactBootstrap.Button,
Table = ReactBootstrap.Table,
Form = ReactBootstrap.Form,
Row = ReactBootstrap.Row,
Col = ReactBootstrap.Col,
InputGroup = ReactBootstrap.InputGroup,
FormControl = ReactBootstrap.FormControl,
MenuItem = ReactBootstrap.MenuItem;

const s = React.createElement;


function Cadets() {
    //react useState returns a state and function that can change it
    const [list, setList] = React.useState([]);
    const [dropdowns, setDropdowns] = React.useState([]);
    const [pages, setPages] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [showModal, setShowModal] = React.useState(false);
    const [modalDescription, setModalDescription] = React.useState("");
    const [cadetNo, setCadetNo] = React.useState(null);
    const [name, setName] = React.useState("");
    const [yearGroup, setYearGroup] = React.useState(9);
    const [section, setSection] = React.useState("");
    const [error, setError] = React.useState("");
    const [searchContent, setSearchContent] = React.useState("");
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");

    
    const success = (data) => {
        setList(data.data);
        // store number of records returned to variable scoped outside of this call
        numRecords = data.count;
        const newPages = [];
        if (data.count > 20) {
            for (let i=0; i<Math.ceil(data.count / 25); i++) {
                newPages.push({
                    name: (i+1).toString(),
                    page: i,
                });
            }
            if (page > newPages.length-1) {
                setPage(page-1); //Making sure that pages are valid
            }
        } else {
            setPage(0);
        }
        setPages(newPages);
    };

    const getData = ()=>{
        console.log("fetching data now")
        // this is where we go to get the data and pass in the const success function as a parameter
        cadets_get_api(page, searchContent, startDate, endDate, success, (text)=>{console.log("Error: ", text)});
    };

    React.useEffect(()=>{getData();
    }, [page]);

    const logout = async (s)=>{
        await localStorage.setItem("salesToken", null);
        window.location = "/login"
    };
    
    //runs on newCadet created, makes a blank modal
    const newCadet = ()=>{
        setModalDescription("New issue");
        setCadetNo(null);
        setName("");
        setYearGroup("");
        setSection("");
        setError("");
        setShowModal(true);
        const itemInput = document.getElementById("itemInput");
        setTimeout(()=>{itemInput && itemInput.focus()}, 1);
    };
    //runs on issue edited, sets all values to previous values to display on modal
    const editCadet = (data)=>{
        setModalDescription("Edit issue");
        setCadetNo(data.cadetNo);
        setName(data.name);
        setYearGroup(data.yearGroup);
        setSection(data.section);
        setError("");
        setShowModal(true);
        const itemInput = document.getElementById("itemInput");
        setTimeout(()=>{itemInput && itemInput.focus()}, 1);
    };

    const deleteCadet = (cadetNo)=>{
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                cadets_delete_api(cadetNo, success, ()=>{
                Swal.fire({
                    title: 'Deleted!',
                    text: "This record has been deleted!",
                    icon: 'success',
                    timer: 1500,
                });
                getData();
            });
            }
        })
    }

    const saveCadet = (s)=>{
        s.preventDefault();
        setError("");
        if (cadetNo === null)
            cadets_post_api({name, yearGroup, section}, ()=> {getData();});
        else
            cadets_put_api(cadetNo, {name, yearGroup, section}, ()=> {getData();});
        setShowModal(false);
    };

return (
    
    <div>
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" sticky="top">
        <Container>
        <Navbar.Brand>
          <img
          src="/static/logo/storesy.png"
          width="30"
          height="30"
          className="d-inline-block align-top"
          alt="Made by Joseph Pannell"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
            <Nav.Link href="/records">Records</Nav.Link>
            <Nav.Link href="/items">Items</Nav.Link>
            <Nav.Link className="active">Cadets</Nav.Link>

            </Nav>
            <Nav>
            <Button variant="outline-danger" onClick={logout}>Logout</Button>
            </Nav>
        </Navbar.Collapse>
        </Container>
        </Navbar>
        <div style={{background: "00000060"}}
            className={"modal " + (showModal?") show d-block":" d-none")}
        tabIndex="-1" role="dialog">
            <div className="modal-dialog shadow">
                <form method="post">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{modalDescription}</h5>
                        <button type="button" className="btn-close" onClick={ ()=>
                        {setShowModal(false)}} aria-label="close"></button>
                    </div>
                    <div className="modal-body">
                            
                            <label style={{marginTop:"0.5em"}}>Cadet Name</label>
                                <div className="form-group">
                                <input type="text" className="form-control" name="name" id="cadetNameInput"
                                            value={name} onChange={(s)=>
                                                {setName(s.target.value)}
                                            }
                                            placeholder="name"/>
                                            
                                </div>
                            <label style={{marginTop:"0.5em"}}>Section</label>
                                <div className="form-group">
                                <input type="text" className="form-control" name="section" id="sectionInput" maxLength="1"
                                            value={section} onChange={(s)=>
                                                {setSection(s.target.value)}
                                            }
                                            placeholder="z"/>
                                </div>
                            <label style={{marginTop:"0.5em"}}>Year Group</label>
                                <div className="form-group">
                                <input type="number" className="form-control" name="yearGroup" min="9" step="1" id="yearGroupInput"
                                            value={yearGroup} onChange={(s)=>
                                                {setYearGroup(s.target.value)}
                                            }
                                            />
                                </div>
                            <small className="form-text text-muted">{error}</small>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={()=>{setShowModal(false)}} data-bs-dismiss="modal">Close</button>
                        <button type="submit" className="btn btn-primary" onClick={saveCadet}>Save changes</button>
                    </div>
                </div>
                </form>
            </div>
        </div>

        <div style={{maxWidth: "850px", margin: "auto", marginTop: "1em", marginBottom: "0em",
                    padding: "1em"}} className="shadow">
        <Form className="center">
            <Row>
                <Col xs={4}>
                <InputGroup mb={2}>
                    <InputGroup.Text>Search: </InputGroup.Text>
                    <FormControl id="inlineFormInputGroup" value={searchContent} onChange={(s)=>
                                                {setSearchContent(s.target.value)}
                                            }
                                            placeholder="Search"/>
                </InputGroup>
                </Col>
                <Col xs="auto">
                <InputGroup className="mb-2">
                    <InputGroup.Text>From: </InputGroup.Text>
                    <FormControl type="date" id="inlineFormInputGroup" value={startDate} onChange={(s)=>
                                                {setStartDate(s.target.value)}
                                            }/>
                </InputGroup>
                </Col>
                <Col xs="auto">
                <InputGroup className="mb-2">
                    <InputGroup.Text>To: </InputGroup.Text>
                    <FormControl type="date" id="inlineFormInputGroup" value={endDate} onChange={(s)=>
                                                {setEndDate(s.target.value)}
                                            }/>
                </InputGroup>
                </Col>
                <Col xs="auto">
                <Button className=" mb-2 btn btn-dark" onClick={getData}>
                    Search!
                </Button>
                </Col>
            </Row>
        </Form>
        <div style={{display: "flex", flexDirection: "row", marginBottom: "5px"}}>
            {pages.length > 0 && <nav className="d-lg-flex justify-content-lg-end dataTables_paginate paging_simple_numbers">
            <ul className="pagination">
                <li className={"page-item " + (page === 0?"disabled":"")} onClick={(s)=>{
                    s.preventDefault();
                    setPage(Math.max(page-1,0));
                }}><a className="page-link" href="#" aria-label="Previous"><span
                    aria-hidden="true">«</span></a></li>
                {pages.map((el)=><li key={"page" + el.page} onClick={(e)=>{
                    setPage(el.page);
                }} className={"page-item "+(page===el.page?"active":"")}>
                <a className="page-link" href="#">
                    {el.name}
                </a></li>)}
                <li className={"page-item " + (page === pages.length-1?"disabled":"")} onClick={(e)=>{
                    setPage(Math.min(page+1,pages.length-1));
                }}><a className="page-link" href="#" aria-label="Next">
                <span
                    aria-hidden="true">»</span></a></li>
            </ul>
            </nav>}
                <span style={{padding: "7px 25px"}}>Showing {numRecords} cadets</span>
                <button className="btn btn-dark" style={{marginLeft: "auto"}}
                onClick={newCadet}>New Cadet</button>
        </div>
        
        <Table responsive striped hover variant="secondary">
            <thead>
            <tr>
            <th>No.</th>
            <th>Name</th>
            <th>YearGroup</th>
            <th>Section</th>
            <th>Registration Date</th>
            </tr>
            </thead>
            <tbody>
            { list.map((row)=>
            <tr key={row.cadetNo}>
                <td>{row.cadetNo}</td>
                <td>{row.name}</td>
                <td>{row.yearGroup}</td>
                <td>{row.section}</td>
                <td>{row.registrationDate}</td>
                <td>
                <a className="btn btn-warning" style={{marginLeft: "auto"}}
                    onClick={(e)=>{editCadet(row)}}>Edit</a>{" "}
                <a className="btn btn-danger" style={{marginLeft: "auto"}}
                    onClick={(e)=>{deleteCadet(row.cadetNo)}}>Delete</a>
                </td>
            </tr>
            )}
            </tbody>
        </Table>
        </div>
        <p className="text-center"><small>Made by Joseph Pannell</small></p>
    </div>
    
);
}
    


const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
    
    s(Cadets),
    domContainer
);
