const cadets_get_api = async (pageNo = "", searchContent, startDate, endDate, success) => {
    const token = await localStorage.getItem("issueToken");
    if (token === null) { //Redirects to go get a token
        console.log("success", JSON.parse(text));
        window.location = "/login";
        return [];
    }
    const response = await fetch(
        `/api/cadets/?page_no=${pageNo}&search_content=${searchContent}&start_date=${startDate}&end_date=${endDate}`, {
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


//POST method api
const cadets_post_api = async (data, success) => {
    const token = await localStorage.getItem("issueToken");
    if (token === null) {
        console.log("No credentials found, redirecting...");
        window.location = "/login";
        return [];
    }
    const response = await fetch(
        `/api/cadets/`, {
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
const cadets_put_api = async (eventId, data, success, fail) => {
    const token = await localStorage.getItem("issueToken");
    if (token === null) {
        console.log("No credentials found, redirecting...");
        window.location = "/login";
        return [];
    }
    const response = await fetch(
        `/api/cadets/${eventId}/`, {
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
const cadets_delete_api = async (eventId, data, success) => {
    const token = await localStorage.getItem("issueToken");
    if (token === null) {
        console.log("No credentials found, redirecting...");
        window.location = "/login";
        return [];
    }
    const response = await fetch(
        `/api/cadets/${eventId}/`, {
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
