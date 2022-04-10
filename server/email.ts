import path from "path";
import fs from "fs";

const serviceKey = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./config/keys.json")).toString()
);

const mailjet = require("node-mailjet").connect(
  (serviceKey as any)["mailjet_key"],
  (serviceKey as any)["mailjet_secret"]
);

function sendEmail({
  email,
  path,
  code,
}: {
  email: string;
  path: string;
  code: string;
}): void {
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "noreply@walky.space",
          Name: "walky.space",
        },
        To: [
          {
            Email: email,
            Name: email,
          },
        ],
        Subject: `You claimed walky.space/${path}`,
        TextPart: `Here's your edit code: ${code} `,
        HTMLPart: `
        <h3>You're now the gardener of walky.space/${path}!</h3> 
        <h1>Edit code: ${code} </h1>
        <h3>You can also follow this link to unlock the space: <a href='http://walky.space/${path}?code=${code}' rel="notrack">walky.space/${path}?code=${code}</a> </h3>
        
        
        <p>
        If you have any questions or comments, you can send them to maxbittker@gmail.com!
        </p>
        <pre>
        </pre>`,
      },
    ],
  });
  request
    .then((result: { body: any }) => {
      console.log(result.body);
    })
    .catch((err: { statusCode: any }) => {
      console.log(err.statusCode);
    });
}
export default sendEmail;
