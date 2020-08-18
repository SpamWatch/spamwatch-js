const axios = require('axios');
const { Ban, Token } = require('./types');
const { UnauthorizedError, ForbiddenError, TooManyRequestsError } = require('./errors');

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

            case 400:
                throw new UnauthorizedError(response, 'Make sure you provide all required data. Check documentation');

            case 401:
                throw new UnauthorizedError(response, 'Make sure your token is correct');

            case 403:
                throw new ForbiddenError(response, this._token);

            case 429:
                throw new TooManyRequestsError(response);
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
        return data.map(token => new Token(token.id, token.permission, token.token, token.userid, token.retired));
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

        return new Token(data.id, data.permission, data.token, data.userid, data.retired);
    }

    /**
     * Gets the Token that the request was made with.
     * @returns {Token}
     */
    async getSelf() {
        const { data } = await this._makeRequest('tokens/self');
        return new Token(data.id, data.permission, data.token, data.userid, data.retired);
    }

    /**
     * Get a token using its ID
     * Requires Root permission
     * @param {Number} tokenid The token ID
     * @returns {Token} The token
     */
    async getToken(tokenid) {
        const { data } = await this._makeRequest(`tokens/${tokenid}`);
        return new Token(data.id, data.permission, data.token, data.userid, data.retired);
    }

    /**
     * Get a token using UserID
     * Requires Root permission
     * @param {Number} userid The user ID
     * @returns {Array} The token
     */
    async getTokenUser(userid) {
        const { data } = await this._makeRequest(`tokens/userid/${userid}`);
        return data.map(token => new Token(token.id, token.permission, token.token, token.userid, token.retired));
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

        return new Ban(data.id, data.reason, data.admin, data.date, data.message);
    }

    /**
     * Get a list of all bans
     * Requires Admin Permission
     * @returns {Ban[]} A list of bans
     */
    async getBans() {
        const { data } = await this._makeRequest('banlist');
        return data.map(ban => new Ban(ban.id, ban.reason, ban.admin, ban.date, ban.message));
    }

    /**
     * Remove a ban
     */
    async deleteBan(userid) {
        await this._makeRequest(`banlist/${userid}`, 'delete');
    }

    /**
     * @returns {Number[]}
     */
    async getBansMin() {
        const { data } = await this._makeRequest('banlist/all');

        if (!data) {
            return [];
        }
        var match = /\r|\n/.exec(data);

        if (match) {
            return data.split('\n').map(uid => Number(uid));
        }else{
            return [data]
        }
        
    }

    /**
     * Adds a ban
     * @param {Number} userid ID of the banned user
     * @param {String} reason Reason why the user was banned
     * @param {String} message message the user was banned for
     */
    async addBan(userid, reason, message) {
        await this._makeRequest('banlist', 'post', {
            data: [
                {
                    id: userid,
                    reason,
                    message,
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

    async stats() {
        const { data } = await this._makeRequest('stats');
        return data;
    }
}

module.exports = {
    Client,
};
