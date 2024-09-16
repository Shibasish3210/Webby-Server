import nodeMailer from "nodemailer";

export const sendEmail = (email, token) => {
	let status;
	const emailTemplate = `
    <h1>Email Verification For CodePlayGround</h1>
    
    <p>Please Veify Your Email By Clicking The Button Below!</p>
    
    <button type="button">
      <a href="${
			process.env.Environment === "production"
				? "https://webby-server.vercel.app"
				: "http://localhost:3333"
		}/auth/verify/${token}">Click Here</a>
    </button>
    
    <p>Thanks for using our service</p>
    `;
	const transport = nodeMailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		service: "gmail",
		secure: true,
		auth: {
			user: "shibasish3210@gmail.com",
			pass: process.env.appPassword,
		},
	});

	const mailOptions = {
		from: "shibasish3210@gmail.com",
		to: email,
		subject: "Email Authentication for Code Playground",
		html: emailTemplate,
	};

	transport.sendMail(mailOptions, (err, info) => {
		if (err) {
			status = false;
		} else {
			status = true;
		}
	});
	console.log(status);
	return status;
};
