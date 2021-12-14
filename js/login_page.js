'use strict';
const s = React.createElement;

function LoginFunction() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [message, setMessage] = React.useState("");

    const success = async (text)=> {
        console.log("Yeah! Authenticated!");
        //creates an issueToken that is used to make sure that users are authorized before each request
        await localStorage.setItem("issueToken", text.access);
        window.location = "/records";
      };
    

      const tryLogin = async (e) => {
        e.preventDefault();
        console.log("Logging in as", username, password);
        await login_api(username, password, success, (text)=>{setMessage(text)});
      };
    
      return (
        //on the creating username box, autoFocus means that it is automatically selected on accessing the page
        //on type is set to password as should obfuscate the password when typed into
          <div style={{width: "400px", margin:"auto", marginTop: "200px",
            boxShadow: "5px 5px 20px #cccccccc",
            padding: "1em"
                    }}>
            <form>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input autoFocus type="text" className="form-control" id="username" placeholder="username"
                        onChange={(s)=>{setUsername(s.target.value)}} value={username}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" id="password" placeholder="password"
                        onChange={(s)=>{setPassword(s.target.value)}} value={password}/>
                </div>
                <div style={{margin: "1em", color: "red"}}>{message}</div>
                <button type="submit" className="btn btn-primary" onClick={tryLogin}>Login</button>
            </form>
          </div>
       );
}
const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
    s(LoginFunction),
    domContainer
);

