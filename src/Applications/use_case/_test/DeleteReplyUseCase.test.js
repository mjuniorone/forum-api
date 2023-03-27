const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const mockReplyId = 'reply-888';
    const mockCommentId = 'comment-888';
    const mockThreadId = 'thread-888';
    const mockOwner = 'user-888';

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(mockThreadId, mockCommentId, mockReplyId, mockOwner);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith(mockThreadId);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith(mockCommentId);
    expect(mockReplyRepository.verifyReplyAvailability)
      .toHaveBeenCalledWith(mockReplyId);
    expect(mockReplyRepository.verifyReplyOwner)
      .toHaveBeenCalledWith(mockReplyId, mockOwner);
    expect(mockReplyRepository.deleteReplyById)
      .toHaveBeenCalledWith(mockReplyId, mockOwner);
  });
});
