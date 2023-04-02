class GetComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id,
      date,
      content,
      username,
      is_delete: isDelete,
      like_count: likeCount,
    } = payload;

    this.id = id;
    this.date = date;

    if (isDelete === 'TRUE') {
      this.content = '**komentar telah dihapus**';
    } else {
      this.content = content;
    }

    this.username = username;
    this.likeCount = +likeCount;
  }

  _verifyPayload({
    id,
    date,
    content,
    username,
    is_delete: isDelete,
    like_count: likeCount,
  }) {
    if (!id || !date || !content || !username || !isDelete || !likeCount) {
      throw new Error('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
      || typeof date !== 'string'
      || typeof content !== 'string'
      || typeof username !== 'string'
      || typeof isDelete !== 'string'
      || typeof +likeCount !== 'number') {
      throw new Error('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetComment;
