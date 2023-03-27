class NewReply {
  constructor(payload, commentId, owner) {
    this._verifyPayload(payload, commentId, owner);

    this.content = payload.content;
    this.commentId = commentId;
    this.owner = owner;
  }

  _verifyPayload(payload, commentId, owner) {
    const { content } = payload;

    if (!content || !commentId || !owner) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string'
    || typeof commentId !== 'string'
    || typeof owner !== 'string') {
      throw new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewReply;
