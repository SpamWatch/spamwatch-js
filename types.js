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
     * @param {Number} admin
     * @param {Number} [date=0]
     * @param {String} [message]
     */
    constructor(id, reason, admin, date = 0, message) {
        this.id = id;
        this.reason = reason;
        this.date = new Date(date * 1000);
        this.timestamp = date;
        this.admin = admin;
        this.message = message;
    }
}

module.exports = {
    Token,
    Ban,
};
