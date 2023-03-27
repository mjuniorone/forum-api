/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async postReply(server, accessToken, threadId, commentId, requestPayload = {
    content: 'helo',
  }) {
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response;
  },

  async deleteReply(server, accessToken, threadId, commentId, replyId) {
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response;
  },

  async addReply(payload = {
    id: 'reply-888',
    date: new Date().toISOString(),
    content: 'helo',
    commentId: 'comment-888',
    owner: 'user-888',
  }) {
    const {
      id,
      date,
      content,
      commentId,
      owner,
    } = payload;
    const query = {
      text: 'INSERT INTO replies VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, content, date, commentId, owner],
    };

    const result = await pool.query(query);

    return result.rows[0].id;
  },

  async findReplyById(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
