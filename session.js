const client = require('./client');

class Session {
	constructor(slpSession, email, password) {
		const { expirationDate, userId, token } = slpSession;

		this.expirationDate = new Date(expirationDate);
		this.userId = userId;
		this.token = token;
		this.email = email;
		this.password = password;
	}

	static async create(email, password) {
		const res = await client.login(email, password);
		return new Session(res.session, email, password);
	}

	isValid() {
		return this.expirationDate.getTime() - Date.now() > 0;
	}

	async refreshToken() {
		const res = await client.login(this.email, this.password);
		const { expirationDate, userId, token } = res.session;

		if (!expirationDate || !token) {
			throw new Error('Invalid 8SLP session data');
		}

		this.expirationDate = new Date(expirationDate);
		this.userId = userId;
		this.token = token;
	}
}

module.exports = Session;
