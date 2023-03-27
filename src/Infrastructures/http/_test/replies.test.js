const pool = require('../../database/postgres/pool');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and new reply', async () => {
      // Arrange
      const server = await createServer(container);

      /* Add thread */
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const {
        payload: threadPayload,
      } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(threadPayload).data.addedThread;

      /* Add comments */
      const {
        payload: commentPayload,
      } = await CommentsTableTestHelper.postComment(server, accessToken, threadId);
      const { id: commentId } = JSON.parse(commentPayload).data.addedComment;

      // Action
      const response = await RepliesTableTestHelper.postReply(
        server,
        accessToken,
        threadId,
        commentId,
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        notContent: 'hi',
      };
      const server = await createServer(container);

      /* Add thread */
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const {
        payload: threadPayload,
      } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(threadPayload).data.addedThread;

      /* Add comment */
      const {
        payload: commentPayload,
      } = await CommentsTableTestHelper.postComment(server, accessToken, threadId);
      const { id: commentId } = JSON.parse(commentPayload).data.addedComment;

      // Action
      const response = await RepliesTableTestHelper.postReply(
        server,
        accessToken,
        threadId,
        commentId,
        requestPayload,
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: true,
      };
      const server = await createServer(container);

      /* Add thread */
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const {
        payload: threadPayload,
      } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(threadPayload).data.addedThread;

      /* Add comment */
      const {
        payload: commentPayload,
      } = await CommentsTableTestHelper.postComment(server, accessToken, threadId);
      const { id: commentId } = JSON.parse(commentPayload).data.addedComment;

      // Action
      const response = await RepliesTableTestHelper.postReply(
        server,
        accessToken,
        threadId,
        commentId,
        requestPayload,
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });

    it('should response 404 when thread id not valid', async () => {
      // Arrange
      const server = await createServer(container);
      const fakeThreadId = 'thread-888';
      const fakeCommentId = 'comment-888';

      /* login user */
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);

      // Action
      const response = await RepliesTableTestHelper.postReply(
        server,
        accessToken,
        fakeThreadId,
        fakeCommentId,
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment id not valid', async () => {
      // Arrange
      const server = await createServer(container);
      const fakeCommentId = 'comment-888';

      /* Add thread */
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(payload).data.addedThread;

      // Action
      const response = await RepliesTableTestHelper.postReply(
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
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and delete reply', async () => {
      // Arrange
      const server = await createServer(container);

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const {
        payload: threadPayload,
      } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(threadPayload).data.addedThread;

      // Add comment
      const { payload: commentPayload } = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
      );
      const { id: commentId } = JSON.parse(commentPayload).data.addedComment;

      // Add reply
      const { payload: replyPayload } = await RepliesTableTestHelper.postReply(
        server,
        accessToken,
        threadId,
        commentId,
      );
      const { id: replyId } = JSON.parse(replyPayload).data.addedReply;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      const deletedReply = await RepliesTableTestHelper.findReplyById(replyId);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(deletedReply.is_delete).toEqual('TRUE');
    });

    it('should response 403 when user not reply owner', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken: otherUser } = await ThreadsTableTestHelper.loginUser(server, {
        username: 'SuperCat',
        password: 'secret cat',
        fullname: 'My Cat',
      });

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const {
        payload: threadPayload,
      } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(threadPayload).data.addedThread;

      // Add comment
      const { payload: commentPayload } = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
      );
      const { id: commentId } = JSON.parse(commentPayload).data.addedComment;

      // Add reply
      const { payload: replyPayload } = await RepliesTableTestHelper.postReply(
        server,
        accessToken,
        threadId,
        commentId,
      );
      const { id: replyId } = JSON.parse(replyPayload).data.addedReply;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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

    it('should response 404 when delete reply in not found thread', async () => {
      // Arrange
      const server = await createServer(container);
      const fakeThreadId = 'thread-12345';

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const {
        payload: threadPayload,
      } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(threadPayload).data.addedThread;

      // Add comment
      const { payload: commentPayload } = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
      );
      const { id: commentId } = JSON.parse(commentPayload).data.addedComment;

      // Add reply
      const { payload: replyPayload } = await RepliesTableTestHelper.postReply(
        server,
        accessToken,
        threadId,
        commentId,
      );
      const { id: replyId } = JSON.parse(replyPayload).data.addedReply;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/${commentId}/replies/${replyId}`,
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

    it('should response 404 when delete reply with not found comment', async () => {
      // Arrange
      const server = await createServer(container);
      const fakeCommentId = 'comment-12345';

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const {
        payload: threadPayload,
      } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(threadPayload).data.addedThread;

      // Add comment
      const { payload: commentPayload } = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
      );
      const { id: commentId } = JSON.parse(commentPayload).data.addedComment;

      // Add reply
      const { payload: replyPayload } = await RepliesTableTestHelper.postReply(
        server,
        accessToken,
        threadId,
        commentId,
      );
      const { id: replyId } = JSON.parse(replyPayload).data.addedReply;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${fakeCommentId}/replies/${replyId}`,
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

    it('should response 404 when reply not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Add thread
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);
      const { payload: thread } = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(thread).data.addedThread;

      // Add comment
      const { payload: commentPayload } = await CommentsTableTestHelper.postComment(
        server,
        accessToken,
        threadId,
      );
      const { id: commentId } = JSON.parse(commentPayload).data.addedComment;

      // Add reply
      const fakeReplyId = 'reply-888';

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${fakeReplyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan tidak ditemukan');
    });
  });
});
