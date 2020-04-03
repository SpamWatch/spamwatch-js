const axios = require('axios');
const { Ban, Token } = require('./types');
const { UnauthorizedError, ForbiddenError } = require('./errors');

class Client {
    /**
     * Client to interface with the SpamWatch API.
     * @param {String} token The Authorization Token
     * @param {String} [host='https://api.spamwat.ch'] The API host. Defaults to the official API.
     */
    constructor(token, host = 'https://api.spamwat.ch') {
        this._host = host;
        this._instance = axios.create({
            validateStatus(status) {
                return status < 500;
            },
        });
        this._instance.defaults.headers.common.Authorization = `Bearer ${token}`;
        this._token = token;
    }

    /**
     * Make a request and handle errors
     * @param {String} path Path on the API without a leading slash
     * @param {String} [method='get'] The request method. Defaults to GET
     * @param {Object} [kwargs] Keyword arguments passed to the request method.
     * @returns {Promise<axios.AxiosResponse>} The json response and the request object
     * @throws {UnauthorizedError} Make sure your token is correct
     * @throws {ForbiddenError}
     */
    async _makeRequest(path, method = 'get', kwargs) {
        const response = await this._instance.request({
            method: method,
            url: `${this._host}/${path}`,
            ...kwargs,
        });

        switch (response.status) {
            default:
                return response;

            case 401:
                throw new UnauthorizedError('Make sure your token is correct');

            case 403:
                throw new ForbiddenError(this._token);
        }
    }

    /**
     * Get the API version
     * @returns {Object}
     */
    async version() {
        const { data } = await this._makeRequest('version');
        return data;
    }

    /**
     * Get all tokens
     * Requires Root permission
     * @returns {Token[]}
     */
    async getTokens() {
        const { data } = await this._makeRequest('tokens');
        return data.map(
            token =>
                new Token(token.id, token.permission, token.token, token.userid)
        );
    }

    /**
     * Creates a token with the given parameters
     * Requires Root permission
     * @param {Number} userid The Telegram User ID of the token owner
     * @param {'Root' | 'Admin' | 'User'} permission The permission level the Token should have
     * @returns {Token|null} The created tokern
     */
    async createToken(userid, permission) {
        const { status, data } = await this._makeRequest('tokens', 'post', {
            data: {
                id: userid,
                permission,
            },
        });

        if (status === 400) {
            return null;
        }

        return new Token(data.id, data.permission, data.token, data.userid);
    }

    /**
     * Gets the Token that the request was made with.
     * @returns {Token}
     */
    async getSelf() {
        const { data } = await this._makeRequest('tokens/self');
        return new Token(data.id, data.permission, data.token, data.userid);
    }

    /**
     * Get a token using its ID
     * Requires Root permission
     * @param {Number} tokenid The token ID
     * @returns {Token} The token
     */
    async getToken(tokenid) {
        const { data } = await this._makeRequest(`tokens/${tokenid}`);
        console.log(data);
        return new Token(data.id, data.permission, data.token, data.userid);
    }

    /**
     * Delete the token using its ID
     * @param tokenid The ID of the token
     */
    async deleteToken(tokenid) {
        await this._makeRequest(`tokens/${tokenid}`, 'delete');
    }

    /**
     * Get a ban
     * @param {Number} userid ID of the user
     * @returns {Ban|Boolean} Ban object or null
     */
    async getBan(userid) {
        const { status, data } = await this._makeRequest(`banlist/${userid}`);

        if (status === 404) {
            return false;
        }

        return new Ban(data.id, data.reason, data.date);
    }

    /**
     * Get a list of all bans
     * Requires Admin Permission
     * @returns {Ban[]} A list of bans
     */
    async getBans() {
        const { data } = await this._makeRequest('banlist');
        return data.map(ban => new Ban(ban.id, ban.reason, ban.date));
    }

    /**
     * Remove a ban
     */
    async deleteBan(userid) {
        await this._makeRequest(`banlist/${userid}`, 'delete');
    }

    /**
     * Adds a ban
     * @param {Number} userid ID of the banned user
     * @param {String} reason Reason why the user was banned
     */
    async addBan(userid, reason) {
        await this._makeRequest('banlist', 'post', {
            data: [
                {
                    id: userid,
                    reason,
                },
            ],
        });
    }

    /**
     * Add a list of Bans
     * @param {Ban[]} data List of Ban objects
     */
    async addBans(data) {
        await this._makeRequest('banlist', 'post', {
            data: data.map(d => ({
                id: d.id,
                reason: d.reason,
            })),
        });
    }
}

module.exports = {
    Client,
};
