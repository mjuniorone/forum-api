const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and new comment', async () => {
      // Arrange
      const server = await createServer(container);

      /* Add thread */
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(payload).data.addedThread;

      // Action
      const response = await CommentsTableTestHelper.postComment(server, accessToken, threadId);

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        notContent: 'hi',
      };
      const server = await createServer(container);

      /* Add thread */
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(payload).data.addedThread;

      // Action
      const response = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
        requestPayload,
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: true,
      };
      const server = await createServer(container);

      /* Add thread */
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(payload).data.addedThread;

      // Action
      const response = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
        requestPayload,
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });

    it('should response 404 when thread id not valid', async () => {
      // Arrange
      const requestPayload = {
        content: 'hi',
      };
      const server = await createServer(container);
      const fakeThreadId = 'thread-888';

      /* login user */
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);

      // Action
      const response = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        fakeThreadId,
        requestPayload,
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 404 when like comment in not found thread', async () => {
      // Arrange
      const server = await createServer(container);
      const fakeThreadId = 'thread-12345';

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload: thread } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(thread).data.addedThread;

      // Add comment
      const { payload: comment } = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
      );
      const { id: commentId } = JSON.parse(comment).data.addedComment;

      // Action
      const response = await CommentsTableTestHelper.putCommentLike(
        server,
        accessToken,
        fakeThreadId,
        commentId,
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload: thread } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(thread).data.addedThread;

      // Add comment
      const fakeCommentId = 'comment-12345';

      // Action
      const response = await CommentsTableTestHelper.putCommentLike(
        server,
        accessToken,
        threadId,
        fakeCommentId,
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 200 and like comment when comment not liked before', async () => {
      // Arrange
      const server = await createServer(container);

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload: thread } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(thread).data.addedThread;

      // Add comment
      const { payload: comment } = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
      );
      const { id: commentId } = JSON.parse(comment).data.addedComment;

      // Action
      const response = await CommentsTableTestHelper.putCommentLike(
        server,
        accessToken,
        threadId,
        commentId,
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      const likes = await CommentsTableTestHelper.findLikesByCommentId(commentId);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(likes).toHaveLength(1);
    });

    it('should response 200 and unlike comment when comment is liked before', async () => {
      // Arrange
      const server = await createServer(container);

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload: thread } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(thread).data.addedThread;

      // Add comment
      const { payload: comment } = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
      );
      const { id: commentId } = JSON.parse(comment).data.addedComment;

      // Like comment
      await CommentsTableTestHelper.putCommentLike(
        server,
        accessToken,
        threadId,
        commentId,
      );

      // Action
      const response = await CommentsTableTestHelper.putCommentLike(
        server,
        accessToken,
        threadId,
        commentId,
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      const likes = await CommentsTableTestHelper.findLikesByCommentId(commentId);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(likes).toHaveLength(0);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment', async () => {
      // Arrange
      const server = await createServer(container);

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload: thread } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(thread).data.addedThread;

      // Add comment
      const { payload: comment } = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
      );
      const { id: commentId } = JSON.parse(comment).data.addedComment;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      const deletedComment = await CommentsTableTestHelper.findCommentById(commentId);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(deletedComment.is_delete).toEqual('TRUE');
    });

    it('should response 403 when user not comment owner', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken: otherUser } = await ThreadsTableTestHelper.loginUser(server, {
        username: 'SuperCat',
        password: 'secret cat',
        fullname: 'My Cat',
      });

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload: thread } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(thread).data.addedThread;

      // Add comment
      const { payload: comment } = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
      );
      const { id: commentId } = JSON.parse(comment).data.addedComment;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${otherUser}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini');
    });

    it('should response 404 when delete comment in not found thread', async () => {
      // Arrange
      const server = await createServer(container);
      const fakeThreadId = 'thread-12345';

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload: thread } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(thread).data.addedThread;

      // Add comment
      const { payload: comment } = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
      );
      const { id: commentId } = JSON.parse(comment).data.addedComment;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload: thread } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(thread).data.addedThread;

      // Add comment
      const fakeCommentId = 'comment-12345';

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${fakeCommentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });
  });
});
