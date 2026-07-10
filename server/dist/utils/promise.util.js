"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withTimeout = (promise, ms, message) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(message));
        }, ms);
        promise
            .then((value) => {
            clearTimeout(timer);
            resolve(value);
        })
            .catch((error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
};
module.exports = {
    withTimeout,
};
