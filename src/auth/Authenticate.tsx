import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as queryString from "query-string";

const Authenticate = ({ setAuthenticated }): JSX.Element => {
  const { search } = useLocation();
  const token = queryString.parse(search).token;

  const navigate = useNavigate();

  React.useEffect(() => {
    console.log(token);
    if (typeof token !== "string") {
      return;
    }
    const authenticate = async () => {
      try {
        const response = await fetch(`/stytch?token=${token}`);
        if (response.ok) {
          // TODO: Add database call to get user and set information here.
          setAuthenticated(true);
          navigate("/");
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error authenticating magic link");
        navigate("/login");
      }
    };

    authenticate();
  }, []);

  return <React.Fragment />;
};

export default Authenticate;
