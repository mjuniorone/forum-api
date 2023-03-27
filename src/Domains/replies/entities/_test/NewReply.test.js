const NewReply = require('../NewReply');

describe('NewReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      notcontent: 'hi',
    };
    const commentId = undefined;
    const owner = '';

    // Action and Assert
    expect(() => new NewReply(payload, commentId, owner)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 888,
    };
    const commentId = [];
    const owner = {};

    // Action and Assert
    expect(() => new NewReply(payload, commentId, owner)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewReply entities correctly', () => {
    // Arrange
    const payload = {
      content: 'hi',
    };
    const commentId = 'comment-888';
    const owner = 'user-888';

    // Action
    const newReply = new NewReply(payload, commentId, owner);

    // Assert
    expect(newReply).toBeInstanceOf(NewReply);
    expect(newReply.content).toEqual(payload.content);
    expect(newReply.commentId).toEqual(commentId);
    expect(newReply.owner).toEqual(owner);
  });
});
