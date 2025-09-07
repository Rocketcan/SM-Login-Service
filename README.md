
# SM-Login-Service
This service authenticates user logins via social media sites using a MERN architecture

## Environment Setup

1. After cloning or downloading this project, copy the sample environment file:
   
	```sh
	cp .env.example .env
	```

2. Open the new `.env` file and fill in your own credentials for Google and LinkedIn OAuth, as well as a random session secret:

	- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Get these from the Google Developer Console.
	- `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`: Get these from the LinkedIn Developer Portal.
	- `SESSION_SECRET`: Use any long, random string.

3. Save the `.env` file. Do not share this file or commit it to version control.

4. Start the backend and frontend as described in the rest of this README.
