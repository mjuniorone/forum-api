const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepository postgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-888',
      username: 'SuperCat',
      password: 'meow',
      fullname: 'MyCat',
    });
    await ThreadsTableTestHelper.addThread();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should add reply to database and return added reply correctly', async () => {
      // Arrange
      const commentId = 'comment-888';
      const owner = 'user-888';
      const newReply = new NewReply({
        content: 'hi',
      }, commentId, owner);

      const fakeIdGenerator = () => '888'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      /* add comment */
      await CommentsTableTestHelper.addComment();

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById(addedReply.id);
      expect(reply).toBeDefined();
      expect(addedReply).toBeInstanceOf(AddedReply);

      expect(addedReply.id).toEqual('reply-888');
      expect(addedReply.content).toEqual(newReply.content);
      expect(addedReply.owner).toEqual(owner);
    });
  });

  describe('getRepliesOfComments function', () => {
    it('should get and return replies of comment correctly', async () => {
      // Arrange
      const commentIds = ['comment-888', 'comment-123'];
      const commentReplies = [
        {
          id: 'reply-888',
          date: new Date().toISOString(),
          content: 'helo',
          comment_id: 'comment-888',
          owner: 'user-888',
          is_delete: 'FALSE',
        },
        {
          id: 'reply-123',
          date: new Date().toISOString(),
          content: 'hi',
          comment_id: 'comment-888',
          owner: 'user-123',
          is_delete: 'FALSE',
        },
        {
          id: 'reply-777',
          date: new Date().toISOString(),
          content: 'helo',
          comment_id: 'comment-123',
          owner: 'user-888',
          is_delete: 'FALSE',
        },
        {
          id: 'reply-321',
          date: new Date().toISOString(),
          content: 'hi',
          comment_id: 'comment-123',
          owner: 'user-123',
          is_delete: 'FALSE',
        },
      ];
      const fakeIdGenerator = () => '888'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      /* Add user */
      await UsersTableTestHelper.addUser({});

      /* Add comments */
      await CommentsTableTestHelper.addComment();
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        date: new Date().toISOString(),
        content: 'hello',
        threadId: 'thread-888',
        owner: 'user-123',
      });

      /* Add replies */
      await RepliesTableTestHelper.addReply({
        ...commentReplies[0],
        commentId: commentReplies[0].comment_id,
      });
      await RepliesTableTestHelper.addReply({
        ...commentReplies[1],
        commentId: commentReplies[1].comment_id,
      });
      await RepliesTableTestHelper.addReply({
        ...commentReplies[2],
        commentId: commentReplies[2].comment_id,
      });
      await RepliesTableTestHelper.addReply({
        ...commentReplies[3],
        commentId: commentReplies[3].comment_id,
      });

      // Action
      const replies = await replyRepositoryPostgres.getRepliesOfComments(commentIds);

      // Assert
      expect(replies).toHaveLength(4);
      expect(replies).toEqual(expect.arrayContaining([
        {
          ...commentReplies[0],
          username: 'SuperCat',
        },
        {
          ...commentReplies[1],
          username: 'dicoding',
        },
        {
          ...commentReplies[2],
          username: 'SuperCat',
        },
        {
          ...commentReplies[3],
          username: 'dicoding',
        },
      ]));
    });
  });

  describe('verifyReplyAvailability function', () => {
    it('should throw NotFoundError if reply not available', async () => {
      // Arrange
      const wrongId = 'reply-123';
      const fakeIdGenerator = () => '888'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      /* add reply */
      await CommentsTableTestHelper.addComment();
      await RepliesTableTestHelper.addReply();

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyAvailability(wrongId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError if reply available', async () => {
      // Arrange
      const replyId = 'reply-888';
      const fakeIdGenerator = () => '888'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      /* add reply */
      await CommentsTableTestHelper.addComment();
      await RepliesTableTestHelper.addReply();

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyAvailability(replyId))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when user not reply owner', async () => {
      // Arrange
      const otherUser = 'user-12345';
      const fakeIdGenerator = () => '888'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      /* add reply */
      await CommentsTableTestHelper.addComment();
      const id = await RepliesTableTestHelper.addReply();

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(id, otherUser))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user is reply owner', async () => {
      // Arrange
      const userId = 'user-888';
      const fakeIdGenerator = () => '888'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      /* add reply */
      await CommentsTableTestHelper.addComment();
      const id = await RepliesTableTestHelper.addReply();

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(id, userId))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReplyById function', () => {
    it('should delete reply correctly', async () => {
      // Arrange
      const owner = 'user-888';
      const fakeIdGenerator = () => '888'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      /* add comment and reply */
      await CommentsTableTestHelper.addComment();
      const id = await RepliesTableTestHelper.addReply();

      // Action
      await replyRepositoryPostgres.deleteReplyById(id, owner);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById(id);
      expect(reply).toBeDefined();
      expect(reply.is_delete).toEqual('TRUE');
    });
  });
});
