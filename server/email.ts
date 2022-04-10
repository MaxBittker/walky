import path from "path";

const serviceKey = path.join(__dirname, "./keys.json");

const mailjet = require("node-mailjet").connect(
  serviceKey as any["mailjet_key"],
  serviceKey as any["mailjet_secret"]
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
          Email: "max@walky.space",
          Name: "walky.space",
        },
        To: [
          {
            Email: email,
            Name: email,
          },
        ],
        Subject: `You just claimed walky.space/${path}`,
        TextPart: `Here's your edit code: ${code} `,
        HTMLPart: `
        <h3>You're now the steward of <a href='http://walky.space/${path}'>walky.space/${path}</a>!</h3> 
        <h1>Edit code: ${code} </h1>
        <h3>You can also follow this link to unlock the space: <a href='http://walky.space/${path}?edit=${code}'>walky.space/${path}?edit=${code}</a> </h3>
        
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
