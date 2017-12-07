let sessions = {};

/**
 * 创建新session
 * @param {*} id 
 */
function createSession(id) {
    sessions[id] = {id: id};
    return sessions[id];
}

/**
 * 获取session,不存在时创建
 * @param {*} id 
 */
exports.get = (id) => {
    let session = sessions[id];
    if(!session) {
        session = createSession(id);
    }
    return session;
}

/**
 * 移除session
 * @param {*} id 
 */
exports.remove = (id) => {
    delete sessions[id];
}