//This file contains the CRUD functionality of the JS front-end to make requests to the django api
//Code to fetch the JSON data containing the items table
const items_get_api = async (pageNo = "", searchContent, success) => {
    const token = await localStorage.getItem("issueToken");
    if (token === null) { //Redirects to go get a token
        console.log("success", JSON.parse(text));
        window.location = "/login";
        return [];
    }
    const response = await fetch(
        `/api/items/?page_no=${pageNo}&search_content=${searchContent}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'Application/JSON',
                'Authorization': `Bearer ${token}`,
            }
        }
    );
    const text = await response.text();
    if (response.status === 401) {
        console.log("Token not valid");
        window.location = "/login";
        return [];
    }
    if (response.status === 200) {
        console.log("success", JSON.parse(text));
        success(JSON.parse(text));
    } else {
        console.log("failed", text)
        const message = "There was an error fetching records from the database"
        failed(message)
    };

};

//Post to API for adding new items to database
const items_post_api = async (data, success) => {
    const token = await localStorage.getItem("issueToken");
    if (token === null) {
        console.log("No credentials found, redirecting...");
        window.location = "/login";
        return [];
    }
    //The below is a data recovery loop tool, this runs through a json string and posts each of the data items to the database, make sure that the format in the demo below is followed
    /*
    var json = [{"itemID": "MTPTR7580", "size": "75/80", "type": "MTP Trousers", "totalQuantity": 5},]
    console.log(JSON.stringify(object))
    console.log(json.length)

    for(var i = 0; i < (json.length -1); i++) {
        var object = json[i]
    
        const response = await fetch(
            `/api/items/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'Application/JSON',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(object)
            }
        );
    }
    */

    const response = await fetch(
        `/api/items/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'Application/JSON',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data)
        }
    );

    const text = await response.text();
    if (response.status === 401) {
        console.log("Token not valid");
        window.location = "/login";
        return [];
    }
    if (response.status === 201) {
        console.log("success", JSON.parse(text));
        success(JSON.parse(text));
    } else {
        console.log("failed", text);
        const message = "This action has resulted in an error, check that all IDs were correct. No record was created."
        failed(message)
    }
};


//PUT method API
const items_put_api = async (eventId, data, success, fail) => {
    const token = await localStorage.getItem("issueToken");
    if (token === null) {
        console.log("No credentials found, redirecting...");
        window.location = "/login";
        return [];
    }
    const response = await fetch(
        `/api/items/${eventId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'Application/JSON',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }
    );

    const text = await response.text();
    if (response.status === 401) {
        console.log("Token not valid");
        window.location = "/login";
        return [];
    }
    if (response.status === 200) {
        console.log("success", JSON.parse(text));
        success(JSON.parse(text));
    } else {
        console.log("failed", text);
        const message = "This action has resulted in an error, check that all IDs were correct. No record was created."
        failed(message)
    }
};


//DELETE method API
const items_delete_api = async (eventId, data, success) => {
    const token = await localStorage.getItem("issueToken");
    if (token === null) {
        console.log("No credentials found, redirecting...");
        window.location = "/login";
        return [];
    }
    const response = await fetch(
        `/api/items/${eventId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'Application/JSON',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }
    );

    const text = await response.text();
    if (response.status === 401) {
        console.log("Token not valid");
        window.location = "/login";
        return [];
    }
    if (response.status === 410) {
        console.log("success", JSON.parse(text));
        success(JSON.parse(text));
    } else {
        console.log("failed", text);
        const message = "This record could not be deleted, it may not have existed in the first place."
        failed(message)
    };
};