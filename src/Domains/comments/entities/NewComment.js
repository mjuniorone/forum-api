class NewComment {
  constructor(payload, threadId, owner) {
    this._verifyPayload(payload, threadId, owner);

    this.content = payload.content;
    this.threadId = threadId;
    this.owner = owner;
  }

  _verifyPayload(payload, threadId, owner) {
    const { content } = payload;

    if (!content || !threadId || !owner) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string'
    || typeof threadId !== 'string'
    || typeof owner !== 'string') {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;
