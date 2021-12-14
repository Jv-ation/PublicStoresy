'use strict';
// number of items scope must be defined outside of call to Items()
var numItems = 0;

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


function Items() {
    //react useState returns a state and function that can change it
    const [list, setList] = React.useState([]);
    const [pages, setPages] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [showModal, setShowModal] = React.useState(false);
    const [modalDescription, setModalDescription] = React.useState("");
    const [itemNo, setItemNo] = React.useState(null);
    const [itemID, setItemID] = React.useState("");
    const [size, setSize] = React.useState("");
    const [type, setType] = React.useState("");
    const [totalQuantity, setTotalQuantity] = React.useState(0);
    const [error, setError] = React.useState("");
    const [searchContent, setSearchContent] = React.useState("");


    const success = (data) => {
        setList(data.data);
        // store number of items returned to variable scoped outside of this call
        numItems = data.count;
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

    //Gets data by passing relevant parameters to the GET function to be passed to the api
    const getData = ()=>{
        console.log("fetching data now")
        // this is where we go to get the data and pass in the const success function as a parameter
        items_get_api(page, searchContent, success, (text)=>{console.log("Error: ", text)});
    };

    React.useEffect(()=>{getData();
    }, [page]);

    const logout = async (s)=>{
        await localStorage.setItem("salesToken", null);
        window.location = "/login"
    };

    
    //runs on newIssue created, makes a blank modal
    const newItem = ()=>{
        setModalDescription("New item");
        setItemNo(null);
        setItemID("");
        setSize("");
        setType("");
        setTotalQuantity(0);
        setError("");
        setShowModal(true);
        const itemInput = document.getElementById("itemInput");
        setTimeout(()=>{itemInput && itemInput.focus()}, 1);
    };
    //runs on issue edited, sets all values to previous values to display on modal
    const editItem = (data)=>{
        setModalDescription("Edit issue");
        setItemNo(data.itemNo);
        setItemID(data.itemID);
        setSize(data.size);
        setType(data.type);
        setTotalQuantity(data.totalQuantity);
        setError("");
        setShowModal(true);
        const itemInput = document.getElementById("itemInput");
        setTimeout(()=>{itemInput && itemInput.focus()}, 1);
    };

    const deleteItem = (itemNo)=>{
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
                items_delete_api(itemNo, success, ()=>{
                Swal.fire({
                    title: 'Deleted!',
                    text: "This item has been deleted!",
                    icon: 'success',
                    timer: 1500,
                });
                getData();
            });
            }
        })
    }

    const saveItem = (s)=>{
        s.preventDefault();
        setError("");
        if (itemNo === null)
            items_post_api({itemID, size, type, totalQuantity}, ()=> {getData();});
        else
            items_put_api(itemNo, {itemID, size, type, totalQuantity}, ()=> {getData();});
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
            <Nav.Link className="active">Items</Nav.Link>
            <Nav.Link href="/cadets">Cadets</Nav.Link>

            </Nav>
            <Nav>
            <Button variant="outline-danger" onClick={logout}>Logout</Button>
            </Nav>
        </Navbar.Collapse>
        </Container>
        </Navbar>
        {/* POST system built here */}
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
                            
                            <label style={{marginTop:"0.5em"}}>Item ID</label>
                                <div className="form-group">
                                <input type="text" className="form-control" name="itemID" id="itemIDInput"
                                            value={itemID} onChange={(s)=>
                                                {setItemID(s.target.value)}
                                            }
                                            placeholder="itemID"/>
                                </div>
                            <label style={{marginTop:"0.5em"}}>Size</label>
                                <div className="form-group">
                                <input type="text" className="form-control" name="size" id="sizeInput"
                                            value={size} onChange={(s)=>
                                                {setSize(s.target.value)}
                                            }
                                            placeholder="size"/>
                                </div>
                                <label style={{marginTop:"0.5em"}}>Type</label>
                                <div className="form-group">
                                <input type="text" className="form-control" name="type" id="typeInput"
                                            value={type} onChange={(s)=>
                                                {setType(s.target.value)}
                                            }
                                            placeholder="type"/>
                                </div>
                                <label style={{marginTop:"0.5em"}}>Q. Total</label>
                                <div className="form-group">
                                <input type="number" className="form-control" name="totalQuantity" min="0" step="1" id="totalQuantityInput"
                                            value={totalQuantity} onChange={(s)=>
                                                {setTotalQuantity(s.target.value)}
                                            }
                                            placeholder="type"/>
                                </div>

                            <small className="form-text text-muted">{error}</small>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={()=>{setShowModal(false)}} data-bs-dismiss="modal">Close</button>
                        <button type="submit" className="btn btn-primary" onClick={saveItem}>Save changes</button>
                    </div>
                </div>
                </form>
            </div>
        </div>
        <div style={{maxWidth: "850px", margin: "auto", marginTop: "1em", marginBottom: "0em",
                    padding: "1em"}} className="shadow">
        <Form style={{marginBottom: "1em"}}>
            <Row className="align-items-center">

                <InputGroup>
                    <InputGroup.Text>Search: </InputGroup.Text>
                    <FormControl id="inlineFormInputGroup" value={searchContent} onChange={(s)=>
                                                {setSearchContent(s.target.value)}
                                            }
                                            placeholder="Search"/>
                </InputGroup>
                
                <a><Button className=" mb-2 btn btn-dark" onClick={getData}>
                    Search!
                    </Button></a>
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
                <span style={{padding: "7px 25px"}}>Showing {numItems} items</span>
            <button className="btn btn-dark" style={{marginLeft: "auto"}}
                onClick={newItem}
            >New Item</button>
        </div>
        {/* Table created here */}
        <Table responsive striped hover variant="secondary">
            <thead className="table-light">
            <tr>
            <th>No.</th>
            <th>ItemID</th>
            <th>Type</th>
            <th>Size</th>
            <th>Q. Issued</th>
            <th>Q. In Stores</th>
            <th>Q. Total</th>
            </tr>
            </thead>
            <tbody>
            { list.map((row)=>
            <tr key={row.itemNo}>
                <td>{row.itemNo}</td>
                <td>{row.itemID}</td>
                <td>{row.type}</td>
                <td>{row.size}</td>
                <td>{row.quantityIssued}</td>
                <td>{row.itemInStores}</td>
                <td>{row.totalQuantity}</td>
                <td>
                <a className="btn btn-warning" style={{marginLeft: "auto"}}
                    onClick={(e)=>{editItem(row)}}>Edit</a>{" "}
                <a className="btn btn-danger" style={{marginLeft: "auto"}}
                    onClick={(e)=>{deleteItem(row.itemNo)}}>Delete</a>
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
    
    s(Items),
    domContainer
);