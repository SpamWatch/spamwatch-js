class SpamWatchError extends Error {}

class UnauthorizedError extends SpamWatchError {}

class ForbiddenError extends SpamWatchError {}

module.exports = {
    SpamWatchError,
    UnauthorizedError,
    ForbiddenError,
};
