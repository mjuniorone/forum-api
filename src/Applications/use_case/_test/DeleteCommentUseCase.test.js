const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const mockCommentId = 'comment-888';
    const mockThreadId = 'thread-888';
    const mockOwner = 'user-888';
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(mockThreadId, mockCommentId, mockOwner);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith(mockThreadId);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith(mockCommentId);
    expect(mockCommentRepository.verifyCommentOwner)
      .toHaveBeenCalledWith(mockCommentId, mockOwner);
    expect(mockCommentRepository.deleteCommentById)
      .toHaveBeenCalledWith(mockCommentId, mockOwner);
  });
});
