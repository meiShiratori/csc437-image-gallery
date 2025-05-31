"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitDuration = waitDuration;
function waitDuration(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
