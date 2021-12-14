//Defining Error function for all APIs, each API generates a string with the message variable declaring it as constant, when the error process for each function runs the appropriate Swal is run
function failed(message) {
    Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
    });
}