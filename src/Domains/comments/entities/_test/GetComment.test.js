const GetComment = require('../GetComment');

describe('GetComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'hi',
    };

    // Action and Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 888,
      date: new Date(),
      content: 'hi',
      username: true,
      is_delete: {},
    };

    // Action and Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-888',
      date: new Date().toISOString(),
      content: 'hi',
      username: 'SuperCat',
      is_delete: 'FALSE',
    };

    // Action
    const addedComment = new GetComment(payload);

    // Assert
    expect(addedComment).toBeInstanceOf(GetComment);
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.date).toEqual(payload.date);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.username).toEqual(payload.username);
  });

  it('should change content to **komentar telah dihapus** if is_delete is TRUE', () => {
    // Arrange
    const payload = {
      id: 'comment-888',
      date: new Date().toISOString(),
      content: 'hi',
      username: 'user-888',
      is_delete: 'TRUE',
    };

    // Action
    const addedComment = new GetComment(payload);

    // Assert
    expect(addedComment).toBeInstanceOf(GetComment);
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.date).toEqual(payload.date);
    expect(addedComment.content).toEqual('**komentar telah dihapus**');
    expect(addedComment.username).toEqual(payload.username);
  });
});
