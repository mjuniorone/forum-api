const GetThread = require('../GetThread');

describe('GetThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'My Cat',
    };

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 888,
      title: 'My Cat',
      body: [],
      date: 123,
      username: true,
    };

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-h_W1Plfpj0TY7wyT2PUPX',
      title: 'My Cat',
      body: 'I love my cat very much',
      date: new Date().toISOString(),
      username: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    // Action
    const getThread = new GetThread(payload);

    // Assert
    expect(getThread).toBeInstanceOf(GetThread);
    expect(getThread.id).toEqual(payload.id);
    expect(getThread.title).toEqual(payload.title);
    expect(getThread.body).toEqual(payload.body);
    expect(getThread.date).toEqual(payload.date);
    expect(getThread.username).toEqual(payload.username);
  });
});
