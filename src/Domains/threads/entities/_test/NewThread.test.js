const NewThread = require('../NewThread');

describe('NewThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'My Cat',
    };
    const owner = 'user-888';

    // Action & Assert
    expect(() => new NewThread(payload, owner)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      title: [],
      body: 888,
    };
    const owner = true;

    // Action & Assert
    expect(() => new NewThread(payload, owner)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewThread entities correctly', () => {
    // Arrange
    const payload = {
      title: 'My Cat',
      body: 'I love my cat very much',
    };
    const owner = 'user-888';

    // Action
    const newThread = new NewThread(payload, owner);

    // Assert
    expect(newThread).toBeInstanceOf(NewThread);
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
    expect(newThread.owner).toEqual(owner);
  });
});
