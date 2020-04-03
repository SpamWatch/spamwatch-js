class Token {
    /**
     * @param {Number} id
     * @param {'Root' | 'Admin' | 'User'} permission
     * @param {String} token
     * @param {Number} userid
     */
    constructor(id, permission, token, userid) {
        this.id = id;
        this.permission = permission;
        this.token = token;
        this.userid = userid;
    }
}

class Ban {
    /**
     * @param {Number} id
     * @param {String} reason
     * @param {Number} date
     */
    constructor(id, reason, date) {
        this.id = id;
        this.reason = reason;
        this.date = new Date(date * 1000);
        this.timestamp = date;
    }
}

module.exports = {
    Token,
    Ban,
};
