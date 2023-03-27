const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'helo',
    };

    const mockAddedReply = new AddedReply({
      id: 'comment-888',
      content: useCasePayload.content,
      owner: 'user-888',
    });
    const mockThreadId = 'thread-888';
    const mockCommentId = 'comment-888';
    const owner = 'user-888';

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedReply({
        id: mockCommentId,
        content: useCasePayload.content,
        owner,
      })));
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      useCasePayload,
      mockThreadId,
      mockCommentId,
      owner,
    );

    // Assert
    expect(addedReply).toStrictEqual(mockAddedReply);
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new NewReply(useCasePayload, mockCommentId, owner),
    );
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(mockThreadId);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(mockCommentId);
  });
});
