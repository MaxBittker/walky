import * as stytchReact from "@stytch/stytch-react";
import * as React from "react";
import "./auth.css";
const STYTCH_PUBLIC_TOKEN =
  "public-token-test-08d11b2e-6a1d-4abf-bf20-b837114c66e2";
//  process.env.REACT_APP_STYTCH_PUBLIC_TOKEN;
// public-token-live-bcc85982-5413-45fc-9da5-38be4431cb90
const Login = () => {
  const stytchProps = {
    loginOrSignupView: {
      products: ["emailMagicLinks"],
      emailMagicLinksOptions: {
        // loginRedirectURL: "http://localhost:4000/authenticate",
        loginRedirectURL: "http://localhost:4000",
        loginExpirationMinutes: 30,
        // signupRedirectURL: "http://localhost:4000/authenticate",
        signupRedirectURL: "http://localhost:4000",
        signupExpirationMinutes: 30
      }
    },
    style: {
      width: "321px",
      primaryColor: "#0577CA",
      primaryTextColor: "#090909"
    },
    publicToken: STYTCH_PUBLIC_TOKEN,
    callbacks: {
      onEvent: (data: {
        eventData: { type: string; userId: any; email: any };
      }) => {
        if (data.eventData.type === "USER_EVENT_TYPE") {
          fetch(`/users`, {
            method: "POST",
            body: JSON.stringify({
              userId: data.eventData.userId,
              email: data.eventData.email
            }),
            headers: {
              "Content-Type": "application/json"
            }
          });
        }
      },
      onSuccess: (data: any) => console.log(data),
      onError: (data: any) => console.log(data)
    }
  };

  React.useEffect(() => {
    function checkStytch() {
      let root = document.getElementsByTagName("stytch-login-form")[0];
      if (!root) {
        setTimeout(checkStytch, 32);
        return;
      }
      var style = document.createElement("style");
      style.innerHTML = "img { display:none; }";
      root.shadowRoot?.appendChild(style);
    }
    setTimeout(checkStytch, 32);
  }, []);
  return (
    <div className="Sign-in-container">
      <stytchReact.Stytch
        publicToken={stytchProps.publicToken}
        loginOrSignupView={stytchProps.loginOrSignupView}
        style={stytchProps.style}
        callbacks={stytchProps.callbacks}
      />
    </div>
  );
};

export default Login;
