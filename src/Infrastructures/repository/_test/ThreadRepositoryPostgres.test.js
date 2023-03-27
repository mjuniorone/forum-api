const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepository postgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-888',
      username: 'SuperCat',
      password: 'meow',
      fullname: 'MyCat',
    });
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should add thread to database and return added thread correctly', async () => {
      // Arrange
      const owner = 'user-888';
      const newThread = new NewThread({
        title: 'My Cat',
        body: 'I love my cat very much',
      }, owner);
      const fakeIdGenerator = () => '888'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById(addedThread.id);
      expect(thread).toHaveLength(1);
      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(addedThread.id).toEqual('thread-888');
      expect(addedThread.title).toEqual('My Cat');
      expect(addedThread.owner).toEqual(owner);
    });
  });

  describe('getThreadById function', () => {
    it('should return added thread correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '888'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      /* add thread */
      const threadId = await ThreadsTableTestHelper.addThread();

      // Action
      const thread = await threadRepositoryPostgres.getThreadById(threadId);

      // Assert
      expect(thread).toBeDefined();
      expect(thread.id).toEqual('thread-888');
      expect(thread.title).toEqual('My Cat');
      expect(thread.body).toEqual('I love my cat very much');
      expect(thread.username).toEqual('SuperCat');
    });
  });

  describe('verifyThreadAvailability function', () => {
    it('should throw NotFoundError if thread not available', async () => {
      // Arrange
      const fakeThreadId = 'thread-12345';
      const fakeIdGenerator = () => '888'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action and Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability(fakeThreadId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError if thread available', async () => {
      // Arrange
      const fakeIdGenerator = () => '888'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      /* add thread */
      const id = await ThreadsTableTestHelper.addThread();

      // Action and Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability(id))
        .resolves.not.toThrowError(NotFoundError);
    });
  });
});
