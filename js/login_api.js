//Post method but only for login API
const login_api = async (username, password, success) => {
    const response = await fetch(
        `/api/token/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "username": username,
                "password": password,
            })
        }
    );
    ///This takes the response to the HTTP request, it then decides whether it was successful
    const text = await response.text();
    if (response.status === 200) {
        ///prints the success and code to console log
        console.log("success", JSON.parse(text));
        success(JSON.parse(text));
    } else {
        ///creates a Swal window using the message text to display to the user
        console.log("failed", text);
        const message = "There was an error logging you in, check your credentials."
        failed(message)
    }
}