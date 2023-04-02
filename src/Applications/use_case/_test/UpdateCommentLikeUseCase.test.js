const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UpdateCommentLikeUseCase = require('../UpdateCommentLikeUseCase');

describe('UpdateCommentLikeUseCase', () => {
  it('should orchestrate the like comment action correctly', async () => {
    // Arrange
    const mockThreadId = 'thread-888';
    const mockCommentId = 'comment-888';
    const mockUserId = 'user-888';

    /* creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /* mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockCommentRepository.likeComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const updateCommentLikeUseCase = new UpdateCommentLikeUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await updateCommentLikeUseCase.execute(mockUserId, mockThreadId, mockCommentId);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith(mockThreadId);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith(mockCommentId);
    expect(mockCommentRepository.checkCommentLike)
      .toHaveBeenCalledWith(mockCommentId, mockUserId);
    expect(mockCommentRepository.likeComment)
      .toHaveBeenCalledWith(mockCommentId, mockUserId);
  });

  it('should orchestrate the unlike comment action correctly', async () => {
    // Arrange
    const mockThreadId = 'thread-888';
    const mockCommentId = 'comment-888';
    const mockUserId = 'user-888';

    /* creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /* mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.unlikeComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const updateCommentLikeUseCase = new UpdateCommentLikeUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await updateCommentLikeUseCase.execute(mockUserId, mockThreadId, mockCommentId);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith(mockThreadId);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith(mockCommentId);
    expect(mockCommentRepository.checkCommentLike)
      .toHaveBeenCalledWith(mockCommentId, mockUserId);
    expect(mockCommentRepository.unlikeComment)
      .toHaveBeenCalledWith(mockCommentId, mockUserId);
  });
});
