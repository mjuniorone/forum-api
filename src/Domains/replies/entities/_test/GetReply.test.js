const GetReply = require('../GetReply');

describe('GetReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'hi',
    };

    // Action and Assert
    expect(() => new GetReply(payload)).toThrowError('GET_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
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
    expect(() => new GetReply(payload)).toThrowError('GET_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetReply entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-888',
      date: new Date().toISOString(),
      content: 'hi',
      username: 'SuperCat',
      is_delete: 'FALSE',
    };

    // Action
    const addedReply = new GetReply(payload);

    // Assert
    expect(addedReply).toBeInstanceOf(GetReply);
    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.date).toEqual(payload.date);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.username).toEqual(payload.username);
  });

  it('should change content of deleted reply and create entity correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-888',
      date: new Date().toISOString(),
      content: 'hi',
      username: 'SuperCat',
      is_delete: 'TRUE',
    };

    // Action
    const getReply = new GetReply(payload);

    // Assert
    expect(getReply).toBeInstanceOf(GetReply);
    expect(getReply.id).toEqual(payload.id);
    expect(getReply.date).toEqual(payload.date);
    expect(getReply.content).toEqual('**balasan telah dihapus**');
    expect(getReply.username).toEqual(payload.username);
  });
});
