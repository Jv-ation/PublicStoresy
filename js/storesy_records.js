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


function Issues() {
    //react useState returns a state and function that can change it
    const [list, setList] = React.useState([]);
    const [dropdowns, setDropdowns] = React.useState([]);
    const [pages, setPages] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [showModal, setShowModal] = React.useState(false);
    const [modalDescription, setModalDescription] = React.useState("");
    const [recordID, setRecordID] = React.useState(null);
    const [itemID, setItemID] = React.useState("");
    const [issuedTO, setIssuedTO] = React.useState("");
    const [issuingNCO, setIssuingNCO] = React.useState("");
    const [specificID, setSpecificID] = React.useState("");
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

    function getDropdowns() {
        const dropdownURL = `/api/records/dropdowns`
        fetch(dropdownURL).then(
                function(u){ return u.json();}
                ).then(
                function(json){
                    setDropdowns(json.dropdowns)
                }
                )
        return dropdowns;
    }
    const getData = ()=>{
        console.log("fetching data now")
        // this is where we go to get the data and pass in the const success function as a parameter
        records_get_issues_api(page, searchContent, startDate, endDate, success, (text)=>{console.log("Error: ", text)});
    };

    React.useEffect(()=>{getData();
    }, [page]);

    const logout = async (s)=>{
        await localStorage.setItem("salesToken", null);
        window.location = "/login"
    };
    
    //runs on newIssue created, makes a blank modal
    const newIssue = ()=>{
        setModalDescription("New issue");
        setRecordID(null);
        setItemID("");
        setIssuingNCO("");
        setIssuedTO("");
        setSpecificID(0);
        setError("");
        getDropdowns();
        setShowModal(true);
        const itemInput = document.getElementById("itemInput");
        setTimeout(()=>{itemInput && itemInput.focus()}, 1);
    };
    //runs on issue edited, sets all values to previous values to display on modal
    const editIssue = (data)=>{
        setModalDescription("Edit issue");
        setRecordID(data.recordID);
        setItemID(data.itemID);
        setIssuingNCO(data.issuingNCO);
        setIssuedTO(data.issuedTO);
        setSpecificID(data.specificID);
        setError("");
        getDropdowns();
        setShowModal(true);
        const itemInput = document.getElementById("itemInput");
        setTimeout(()=>{itemInput && itemInput.focus()}, 1);
    };

    const deleteIssue = (recordID)=>{
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
                records_delete_record_api(recordID, success, ()=>{
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

    const saveIssue = (s)=>{
        s.preventDefault();
        setError("");
        if (recordID === null)
            records_post_record_api({itemID, issuedTO, issuingNCO, specificID}, ()=> {getData();});
        else
            records_put_record_api(recordID, {itemID, issuedTO, issuingNCO, specificID}, ()=> {getData();});
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
            <Nav.Link className="active">Records</Nav.Link>
            <Nav.Link href="/items">Items</Nav.Link>
            <Nav.Link href="/cadets">Cadets</Nav.Link>

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
                            
                            <label style={{marginTop:"0.5em"}}>Issued To</label>
                                <div className="form-group">
                                <select type="text" className="form-control" name="issuedTO" id="cadetNameInput"
                                            value={issuedTO} onChange={(s)=>
                                                {setIssuedTO(s.target.value)}
                                            }
                                            >
                                            <option>Cadet</option>
                                            {
                                            dropdowns.map(q => (
                                                <option key={q.name} value={q.name}>
                                                    {q.name}
                                                </option>
                                            ))}
                                            </select>
                                </div>
                            <label style={{marginTop:"0.5em"}}>Issued By</label>
                                <div className="form-group">
                                <input type="text" className="form-control" name="issuingNCO" id="issuingNCOInput" maxLength="3"
                                            value={issuingNCO} onChange={(s)=>
                                                {setIssuingNCO(s.target.value)}
                                            }
                                            placeholder="Issued By"/>
                                </div>
                                <label style={{marginTop:"0.5em"}}>ItemID</label>
                                <div className="form-group">
                                <input type="text" className="form-control" name="itemID" id="itemIDInput"
                                            value={itemID} onChange={(s)=>
                                                {setItemID(s.target.value)}
                                            }
                                            placeholder="Item ID"/>
                                </div>
                                <label style={{marginTop:"0.5em"}}>Specific ID</label>
                                <div className="form-group">
                                <input type="number" className="form-control" name="specificID" min="0" step="1" id="specificIDInput"
                                            value={specificID} onChange={(s)=>
                                                {setSpecificID(s.target.value)}
                                            }
                                            placeholder="type"/>
                                </div>
                            <small className="form-text text-muted">{error}</small>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={()=>{setShowModal(false)}} data-bs-dismiss="modal">Close</button>
                        <button type="submit" className="btn btn-primary" onClick={saveIssue}>Save changes</button>
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
                <span style={{padding: "7px 25px"}}>Showing {numRecords} records</span>
                <button className="btn btn-dark" style={{marginLeft: "auto"}}
                onClick={newIssue}>New Issue</button>
        </div>
        {/* Table created here */}
        <Table responsive striped hover variant="secondary">
            <thead>
            <tr>
            <th>ID</th>
            <th>Date</th>
            <th>ItemID</th>
            <th>Cadet Name</th>
            <th>Issued By</th>
            <th>sID</th>
            </tr>
            </thead>
            <tbody>
            { list.map((row)=>
            <tr key={row.recordID}>
                <td>{row.recordID}</td>
                <td>{row.issueDate}</td>
                <td>{row.itemID}</td>
                <td>{row.issuedTO}</td>
                <td>{row.issuingNCO}</td>
                <td>{row.specificID}</td>
                <td>
                <a className="btn btn-warning" style={{marginLeft: "auto"}}
                    onClick={(e)=>{editIssue(row)}}>Edit</a>{" "}
                <a className="btn btn-danger" style={{marginLeft: "auto"}}
                    onClick={(e)=>{deleteIssue(row.recordID)}}>Delete</a>
                </td>
            </tr>
            )}
            </tbody>
        </Table>
        </div>
        <p className="text-center" style={{color: "#dbdbdb"}}><small>Made with <span>&#9829;</span> by Joseph Pannell</small></p>
    </div>
    
);
}
    


const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
    
    s(Issues),
    domContainer
);