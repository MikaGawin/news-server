const db = require("../../db/connection");

exports.removeCommentById = (commentId) => {
    const sqlQuery = `
    DELETE FROM comments
    WHERE comment_id = $1`

    return db.query(sqlQuery, [commentId])
    .then(({rowCount}) => {
        if(!rowCount){
            
        }
    })
};
