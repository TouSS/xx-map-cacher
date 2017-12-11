let sessions = {};

/**
 * 创建新session
 * @param {*} id 
 */
function createSession(id) {
    sessions[id] = {
        id: id
    };
    return sessions[id];
}

/**
 * 获取session,不存在时创建
 * @param {*} id 
 */
exports.get = (id) => {
    let session = sessions[id];
    if (!session) {
        session = createSession(id);
    }
    return session;
}

/**
 * 移除session
 * @param {*} session
 */
exports.remove = (session) => {
    delete sessions[session.id];
}

/**
 * 下线session
 * @param {*} session 
 */
exports.offline = (session) => {
    delete session.socket;
}

/**
 * 报告状态
 * @param {*} session 
 */
exports.report = (session) => {
    if (session.socket) {
        session.socket.emit('status', {
            total: session.total,
            completed: session.completed,
            failure: session.failure,
            startTime: session.startTime,
            endTime: session.endTime
        });
    }
}

/**
 * 报告错误
 * @param {*} session 
 * @param {*} error 
 */
exports.error = (session, error) => {
    if (session.socket) {
        session.socket.emit('error', error);
    }
}