class SpamWatchError extends Error {
    constructor(response, message) {
        super(message);
        this.status = response.status;
    }
}

class UnauthorizedError extends SpamWatchError {}

class ForbiddenError extends SpamWatchError {}

class TooManyRequestsError extends SpamWatchError {
    constructor(response) {
        const method = new URL(response.config.url).pathname.slice(1);
        const until = new Date((response.data.until || 0) * 1000);

        super(response, `Too Many Requests for method '${method}'`);
        this.method = method;
        this.until = until;
    }
}

module.exports = {
    SpamWatchError,
    UnauthorizedError,
    ForbiddenError,
    TooManyRequestsError,
};
