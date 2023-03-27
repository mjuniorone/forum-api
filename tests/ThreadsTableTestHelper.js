/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {

  async loginUser(server, user = {
    username: 'dicoding',
    password: 'secret',
    fullname: 'Dicoding Indonesia',
  }) {
    // add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: user,
    });

    // login user
    const { payload } = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: user.username,
        password: user.password,
      },
    });

    return JSON.parse(payload).data;
  },

  async postThread(server, accessToken, requestPayload = {
    title: 'My Cat',
    body: 'I love my cat very much',
  }) {
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response;
  },

  async addThread(payload = {
    id: 'thread-888',
    title: 'My Cat',
    body: 'I love my cat very much',
    date: new Date().toISOString(),
    owner: 'user-888',
  }) {
    const {
      id,
      title,
      body,
      date,
      owner,
    } = payload;
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, title, body, date, owner],
    };

    const result = await pool.query(query);

    return result.rows[0].id;
  },

  async findThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
