const GetThread = require('../../../Domains/threads/entities/GetThread');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const GetReply = require('../../../Domains/replies/entities/GetReply');
// const GetReply = require('../../../Domains/replies/entities/GetReply');

describe('GetThreadUseCase', () => {
  it('should orchestrate the get thread action correctly', async () => {
    // Arrange
    const mockThreadId = 'thread-888';

    const mockComments = [
      {
        id: 'comment-_pby2_tmXV6bcvcdev8xk',
        date: '2021-08-08T07:22:33.555Z',
        content: 'hi',
        thread_id: mockThreadId,
        owner: 'user-888',
        is_delete: 'FALSE',
        username: 'SuperCat',
      },
      {
        id: 'comment-yksuCoxM2s4MMrZJO-qVD',
        date: '2021-08-08T07:26:21.338Z',
        content: 'I have a cat too',
        thread_id: mockThreadId,
        owner: 'user-123',
        is_delete: 'FALSE',
        username: 'dicoding',
      },
    ];
    const mockCommentIds = mockComments.map((comment) => comment.id);

    const mockReplies = [
      {
        id: 'reply-BErOXUSefjwWGW1Z10Ihk',
        content: 'helo',
        date: '2021-08-08T07:59:48.766Z',
        comment_id: 'comment-_pby2_tmXV6bcvcdev8xk',
        owner: 'user-123',
        is_delete: 'FALSE',
        username: 'dicoding',
      },
      {
        id: 'reply-BErOXUSefjwWGW1Z10Ihk',
        content: 'nice to meet ya',
        date: '2021-08-08T07:59:48.423Z',
        comment_id: 'comment-_pby2_tmXV6bcvcdev8xk',
        owner: 'user-123',
        is_delete: 'FALSE',
        username: 'dicoding',
      },
      {
        id: 'reply-BErOXUSefjwWGW1Z10Ihk',
        content: 'Oh wow really?',
        date: '2021-08-08T07:59:50.673Z',
        comment_id: 'comment-yksuCoxM2s4MMrZJO-qVD',
        owner: 'user-888',
        is_delete: 'FALSE',
        username: 'SuperCat',
      },
      {
        id: 'reply-BErOXUSefjwWGW1Z10Ihk',
        content: 'That\'s Amazing!',
        date: '2021-08-08T07:59:50.154Z',
        comment_id: 'comment-yksuCoxM2s4MMrZJO-qVD',
        owner: 'user-888',
        is_delete: 'FALSE',
        username: 'SuperCat',
      },
    ];

    const mockDetailThread = new ThreadDetail({
      id: 'thread-888',
      title: 'My Cat',
      body: 'I love my cat very much',
      date: '2023-03-03T11:02:01.617Z',
      username: 'SuperCat',
      comments: [
        {
          id: 'comment-_pby2_tmXV6bcvcdev8xk',
          date: '2021-08-08T07:22:33.555Z',
          content: 'hi',
          username: 'SuperCat',
          replies: [
            new GetReply({
              id: 'reply-BErOXUSefjwWGW1Z10Ihk',
              content: 'helo',
              date: '2021-08-08T07:59:48.766Z',
              username: 'dicoding',
              is_delete: 'FALSE',
            }),
            new GetReply({
              id: 'reply-BErOXUSefjwWGW1Z10Ihk',
              content: 'nice to meet ya',
              date: '2021-08-08T07:59:48.423Z',
              username: 'dicoding',
              is_delete: 'FALSE',
            }),
          ],
        },
        {
          id: 'comment-yksuCoxM2s4MMrZJO-qVD',
          date: '2021-08-08T07:26:21.338Z',
          content: 'I have a cat too',
          username: 'dicoding',
          replies: [
            new GetReply({
              id: 'reply-BErOXUSefjwWGW1Z10Ihk',
              content: 'Oh wow really?',
              date: '2021-08-08T07:59:50.673Z',
              username: 'SuperCat',
              is_delete: 'FALSE',
            }),
            new GetReply({
              id: 'reply-BErOXUSefjwWGW1Z10Ihk',
              content: 'That\'s Amazing!',
              date: '2021-08-08T07:59:50.154Z',
              username: 'SuperCat',
              is_delete: 'FALSE',
            }),
          ],
        },
      ],
    });

    /* creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();

    /* Mocking */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(new GetThread({
        id: 'thread-888',
        title: 'My Cat',
        body: 'I love my cat very much',
        date: '2023-03-03T11:02:01.617Z',
        username: 'SuperCat',
      })));

    mockCommentRepository.getCommentsInThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));

    mockReplyRepository.getRepliesOfComments = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    // mockUserRepository.getUsernameById = jest.fn()
    //   .mockImplementation(() => Promise.resolve('SuperCat'));

    /* creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const threadDetail = await getThreadUseCase.execute(mockThreadId);

    // Assert
    expect(threadDetail).toBeInstanceOf(ThreadDetail);
    expect(threadDetail).toStrictEqual(mockDetailThread);

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(mockThreadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(mockThreadId);
    expect(mockCommentRepository.getCommentsInThread).toBeCalledWith(mockThreadId);
    expect(mockReplyRepository.getRepliesOfComments).toBeCalledWith(mockCommentIds);
  });
});
