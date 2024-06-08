"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth = (bearerToken) => {
    return new Promise((resolve, reject) => {
        const token = bearerToken.replace('Bearer ', '');
        if (token === 'fakeToken') {
            resolve({ userId: 'faceUserId' });
            return;
        }
        resolve({ error: { type: 'unauthorized', message: 'Authentication Failed' } });
    });
};
exports.default = { auth: auth };
