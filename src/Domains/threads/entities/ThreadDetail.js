class ThreadDetail {
  constructor(payload) {
    this._veryifyPayload(payload);

    this.id = payload.id;
    this.title = payload.title;
    this.body = payload.body;
    this.date = payload.date;
    this.username = payload.username;
    this.comments = payload.comments;
  }

  _veryifyPayload(payload) {
    const {
      id,
      title,
      body,
      date,
      username,
      comments,
    } = payload;

    if (!id
      || !title
      || !body
      || !date
      || !username
      || !comments
    ) {
      throw new Error('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
      || typeof title !== 'string'
      || typeof body !== 'string'
      || typeof date !== 'string'
      || typeof username !== 'string'
      || typeof comments !== 'object'
    ) {
      throw new Error('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ThreadDetail;
