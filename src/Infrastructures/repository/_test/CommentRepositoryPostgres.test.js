const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepository postgres', () => {
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
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should add comment to database and return added comment correctly', async () => {
      // Arrange
      const threadId = 'thread-888';
      const owner = 'user-888';
      const newComment = new NewComment({
        content: 'hi',
      }, threadId, owner);

      const fakeIdGenerator = () => '888'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(addedComment.id);
      expect(comment).toBeDefined();
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-888',
        content: newComment.content,
        owner,
      }));
    });
  });

  describe('getCommentsInThread function', () => {
    it('should get comments correctly', async () => {
      // Arrange
      const threadId = 'thread-888';
      const comments = [
        {
          id: 'comment-888',
          date: new Date().toISOString(),
          content: 'hi',
          threadId,
          owner: 'user-888',
        },
        {
          id: 'comment-123',
          date: new Date().toISOString(),
          content: 'helo',
          threadId,
          owner: 'user-123',
        },
      ];

      const expectedComments = [
        {
          id: comments[0].id,
          date: comments[0].date,
          content: comments[0].content,
          thread_id: threadId,
          owner: comments[0].owner,
          is_delete: 'FALSE',
          username: 'SuperCat',
          like_count: '1',
        },
        {
          id: comments[1].id,
          date: comments[1].date,
          content: comments[1].content,
          thread_id: threadId,
          owner: comments[1].owner,
          is_delete: 'FALSE',
          username: 'dicoding',
          like_count: '1',
        },
      ];

      const fakeIdGenerator = () => '888'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /* add users */
      await UsersTableTestHelper.addUser({});

      /* add comments */
      await CommentsTableTestHelper.addComment(comments[0]);
      await CommentsTableTestHelper.addComment(comments[1]);

      /* like comments */
      await CommentsTableTestHelper.likeComment();
      await CommentsTableTestHelper.likeComment('like-777', 'user-888', 'comment-123');

      // Action
      const threadComments = await commentRepositoryPostgres.getCommentsInThread(threadId);

      // Assert
      expect(threadComments).toHaveLength(2);
      expect(threadComments).toStrictEqual(expectedComments);
    });
  });

  describe('deleteCommentById function', () => {
    it('should delete comment correctly', async () => {
      // Arrange
      const owner = 'user-888';
      const fakeIdGenerator = () => '888'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /* add comment */
      const id = await CommentsTableTestHelper.addComment();

      // Action
      await commentRepositoryPostgres.deleteCommentById(id, owner);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(id);
      expect(comment).toBeDefined();
      expect(comment.is_delete).toEqual('TRUE');
    });
  });

  describe('likeComment function', () => {
    it('should like comment correctly', async () => {
      // Arrange
      const userId = 'user-888';
      const fakeIdGenerator = () => '888'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /* add comment */
      const commentId = await CommentsTableTestHelper.addComment();

      // Action
      await commentRepositoryPostgres.likeComment(commentId, userId);

      // Assert
      const likes = await CommentsTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(1);
      expect(likes[0]).toStrictEqual({
        id: 'like-888',
        user_id: userId,
        comment_id: commentId,
      });
    });
  });

  describe('unlikeComment function', () => {
    it('should unlike comment correctly', async () => {
      // Arrange
      const userId = 'user-888';
      const fakeIdGenerator = () => '888'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /* add comment */
      const commentId = await CommentsTableTestHelper.addComment();

      /* like comment */
      await CommentsTableTestHelper.likeComment();

      // Action
      await commentRepositoryPostgres.unlikeComment(commentId, userId);

      // Assert
      const likes = await CommentsTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(0);
    });
  });

  describe('checkCommentLike function', () => {
    it('should check and find that user has not liked comment and return false', async () => {
      // Arrange
      const userId = 'user-888';
      const fakeIdGenerator = () => '888'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /* add comment */
      const commentId = await CommentsTableTestHelper.addComment();

      // Action
      const checkResult = await commentRepositoryPostgres.checkCommentLike(commentId, userId);

      // Assert
      expect(checkResult).toEqual(false);
    });

    it('should check and find that user has already liked comment and return true', async () => {
      // Arrange
      const userId = 'user-888';
      const fakeIdGenerator = () => '888'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /* add comment */
      const commentId = await CommentsTableTestHelper.addComment();

      /* like comment */
      await CommentsTableTestHelper.likeComment();

      // Action
      const checkResult = await commentRepositoryPostgres.checkCommentLike(commentId, userId);

      // Assert
      expect(checkResult).toEqual(true);
    });
  });

  describe('verifyCommentAvailability function', () => {
    it('should throw NotFoundError if comment not available', async () => {
      // Arrange
      const wrongId = 'notcomment-123';
      const fakeIdGenerator = () => '888'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /* add comment */
      await CommentsTableTestHelper.addComment();

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability(wrongId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError if comment available', async () => {
      // Arrange
      const commentId = 'comment-888';
      const fakeIdGenerator = () => '888'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /* add comment */
      await CommentsTableTestHelper.addComment();

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability(commentId))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when user not comment owner', async () => {
      // Arrange
      const otherUser = 'user-12345';
      const fakeIdGenerator = () => '888'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /* add comment */
      const id = await CommentsTableTestHelper.addComment();

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(id, otherUser))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user is comment owner', async () => {
      // Arrange
      const userId = 'user-888';
      const fakeIdGenerator = () => '888'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /* add comment */
      const id = await CommentsTableTestHelper.addComment();

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(id, userId))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });
});
