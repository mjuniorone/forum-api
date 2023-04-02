const pool = require('../../database/postgres/pool');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTesthelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTesthelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'My Cat',
      };
      const server = await createServer(container);
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);

      // Action
      const response = await ThreadsTableTestHelper.postThread(server, accessToken, requestPayload);

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 888,
        body: true,
      };
      const server = await createServer(container);
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);

      // Action
      const response = await ThreadsTableTestHelper.postThread(server, accessToken, requestPayload);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 201 and new thread', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);

      // Action
      const response = await ThreadsTableTestHelper.postThread(server, accessToken);

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and get thread, comments, and replies', async () => {
      // Arrange
      const server = await createServer(container);

      /* login users */
      const { accessToken: firstToken } = await ThreadsTableTestHelper.loginUser(server);
      const { accessToken: secondToken } = await ThreadsTableTestHelper.loginUser(server, {
        username: 'SuperCat',
        password: 'meow',
        fullname: 'My Cat',
      });

      /* add thread */
      const thread = await ThreadsTableTestHelper.postThread(server, firstToken);
      const { id: threadId } = JSON.parse(thread.payload).data.addedThread;

      /* add comments */
      const firstComment = await CommentsTableTesthelper.postComment(server, firstToken, threadId);
      const secondComment = await CommentsTableTesthelper.postComment(
        server,
        firstToken,
        threadId,
        {
          content: 'helo',
        },
      );
      const { id: firstCommentId } = JSON.parse(firstComment.payload).data.addedComment;
      const { id: secondCommentId } = JSON.parse(secondComment.payload).data.addedComment;

      /* like comments */
      // like and unlike
      await CommentsTableTesthelper.putCommentLike(server, secondToken, threadId, firstCommentId);
      await CommentsTableTesthelper.putCommentLike(server, secondToken, threadId, firstCommentId);

      await CommentsTableTesthelper.putCommentLike(server, secondToken, threadId, firstCommentId);
      await CommentsTableTesthelper.putCommentLike(server, firstToken, threadId, secondCommentId);
      await CommentsTableTesthelper.putCommentLike(server, secondToken, threadId, secondCommentId);

      /* add replies */
      await RepliesTableTestHelper.postReply(server, firstToken, threadId, firstCommentId);
      await RepliesTableTestHelper.postReply(server, secondToken, threadId, secondCommentId);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(1);
      expect(responseJson.data.thread.comments[1].replies).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].likeCount).toBe(1);
      expect(responseJson.data.thread.comments[1].likeCount).toBe(2);
    });

    it('should response 200 and get thread and deleted comment and deleted reply', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await ThreadsTableTestHelper.loginUser(server);

      /* add thread */
      const thread = await ThreadsTableTestHelper.postThread(server, accessToken);
      const { id: threadId } = JSON.parse(thread.payload).data.addedThread;

      /* add comments */
      const firstComment = await CommentsTableTesthelper.postComment(server, accessToken, threadId);
      const secondComment = await CommentsTableTesthelper.postComment(
        server,
        accessToken,
        threadId,
        {
          content: 'helo',
        },
      );
      const { id: firstCommentId } = JSON.parse(firstComment.payload).data.addedComment;
      const { id: secondCommentId } = JSON.parse(secondComment.payload).data.addedComment;

      /* add replies */
      await RepliesTableTestHelper.postReply(server, accessToken, threadId, firstCommentId);
      const secondReply = await RepliesTableTestHelper
        .postReply(server, accessToken, threadId, secondCommentId);
      const { id: secondReplyId } = JSON.parse(secondReply.payload).data.addedReply;

      /* delete comment and reply */
      await CommentsTableTesthelper.deleteComment(server, accessToken, threadId, firstCommentId);
      await RepliesTableTestHelper
        .deleteReply(server, accessToken, threadId, secondCommentId, secondReplyId);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      const deletedCommentContent = responseJson.data.thread.comments[0].content;
      const deletedReplyContent = responseJson.data.thread.comments[1].replies[0].content;

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();

      expect(deletedCommentContent).toEqual('**komentar telah dihapus**');
      expect(deletedReplyContent).toEqual('**balasan telah dihapus**');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const threadId = 'thread-888';
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
