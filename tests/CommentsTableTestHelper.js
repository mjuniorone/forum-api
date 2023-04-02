/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async postComment(server, accessToken, threadId, requestPayload = {
    content: 'hi',
  }) {
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response;
  },

  async putCommentLike(server, accessToken, threadId, commentId) {
    const response = await server.inject({
      method: 'PUT',
      url: `/threads/${threadId}/comments/${commentId}/likes`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response;
  },

  async deleteComment(server, accessToken, threadId, commentId) {
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response;
  },

  async addComment(payload = {
    id: 'comment-888',
    date: new Date().toISOString(),
    content: 'hi',
    threadId: 'thread-888',
    owner: 'user-888',
  }) {
    const {
      id,
      date,
      content,
      threadId,
      owner,
    } = payload;
    const query = {
      text: 'INSERT INTO comments VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, date, content, threadId, owner],
    };

    const result = await pool.query(query);

    return result.rows[0].id;
  },

  async likeComment(id = 'like-888', userId = 'user-888', commentId = 'comment-888') {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3)',
      values: [id, userId, commentId],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async findLikesByCommentId(commentId) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
