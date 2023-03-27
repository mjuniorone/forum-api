const NewComment = require('../NewComment');

describe('NewComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      notcontent: 'hi',
    };
    const threadId = undefined;
    const owner = '';

    // Action and Assert
    expect(() => new NewComment(payload, threadId, owner)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 888,
    };
    const threadId = [];
    const owner = {};

    // Action and Assert
    expect(() => new NewComment(payload, threadId, owner)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment entities correctly', () => {
    // Arrange
    const payload = {
      content: 'hi',
    };
    const threadId = 'thread-888';
    const owner = 'user-888';

    // Action
    const newComment = new NewComment(payload, threadId, owner);

    // Assert
    expect(newComment).toBeInstanceOf(NewComment);
    expect(newComment.content).toEqual(payload.content);
  });
});
