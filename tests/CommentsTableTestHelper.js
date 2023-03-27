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

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
