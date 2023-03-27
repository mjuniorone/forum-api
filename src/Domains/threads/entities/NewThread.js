class NewThread {
  constructor(payload, owner) {
    this._verifyPayload(payload, owner);

    this.title = payload.title;
    this.body = payload.body;
    this.owner = owner;
  }

  _verifyPayload(payload, owner) {
    const { title, body } = payload;

    if (!title || !body || !owner) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string' || typeof owner !== 'string') {
      throw new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewThread;
